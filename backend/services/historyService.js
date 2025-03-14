import db from "../config/db.js";

export function userHistory(userId, callback) {
    console.log(`🛠️ Running query for user ID: ${userId}`);
    
    const query = `
        SELECT 
            b.id AS bet_id,
            b.chosen_nums,
            b.amount,
            b.is_winner,
            b.created_at
        FROM 
            bets b
        LEFT JOIN 
            prize_history p ON b.game_id = p.game_id AND b.user_id = p.user_id
        WHERE 
            b.user_id = ?
        ORDER BY 
            b.created_at DESC
        LIMIT 5; -- ✅ Only fetch the last 5 bets
    `;

    db.query(query, [userId], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching user history:", err);
            return callback(err, null);
        }

        console.log("🛠️ Query Result:", rows); 

        if (rows.length > 0) {
            const history = rows.map(row => ({
                bet_id: row.bet_id,
                chosen_nums: (() => {
                    try {
                        return JSON.parse(row.chosen_nums);
                    } catch (error) {
                        return row.chosen_nums ? row.chosen_nums.split('-').map(Number) : [];
                    }
                })(),
                amount: row.amount,
                is_winner: row.is_winner === 1,
                timestamp: row.created_at
            }));

            callback(null, {
                success: true,
                history
            });
        } else {
            console.warn("⚠️ No bet history found for user:", userId);
            callback(null, {
                success: false,
                message: "No bet history found."
            });
        }
    });
}
