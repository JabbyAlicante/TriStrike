import db from "../config/db.js";

export async function getTotalPrizePool(io, gameId) {
    if (!io) {
        console.error("❌ io is undefined in distributePrizePool");
        return;
    }

    if (!gameId) {
        console.log("⚠️ Missing game ID");
        io.emit("prize_pool_response", {
            success: false,
            code: "MISSING_GAME_ID",
            message: "Game ID is required"
        });
        return;
    }

    try {
        const [results] = await db.query(
            "SELECT SUM(amount) AS totalPrizePool FROM bets WHERE game_id = ?",
            [gameId]
        );

        if (results.length > 0) {
            const prizePool = results[0].totalPrizePool || 0;

            console.log(`✅ Prize pool for game ${gameId}: ${prizePool}`);

            io.emit("prize_pool_response", {
                success: true,
                gameId,
                prizePool,
                message: `Prize pool fetched successfully`
            });

            return prizePool;
        } else {
            console.log(`⚠️ No prize pool data found for game ${gameId}`);

            io.emit("prize_pool_response", {
                success: false,
                code: "NO_PRIZE_POOL_DATA",
                message: `No prize pool data found for game ${gameId}`
            });

            return 0;
        }
    } catch (err) {
        console.error(`❌ Error fetching prize pool for game ${gameId}:`, err);

        io.emit("prize_pool_response", {
            success: false,
            code: "PRIZE_POOL_FETCH_ERROR",
            message: "Error fetching prize pool",
            error: err.message
        });

        throw err;
    }
}


export async function updatePrizePoolInGame(gameId, prizePool) {
    try {
        await db.query(
            `UPDATE games SET prize_pool = ? WHERE id = ?`,
            [prizePool, gameId]
        );

        console.log(`✅ Prize pool updated for Game ${gameId}: ${prizePool}`);
    } catch (err) {
        console.error("❌ Error updating prize pool in games table:", err);
        throw err;
    }
}

