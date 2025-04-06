# Tristrike
## 🛠️ Tech Stack

| Technology        | Purpose                                           |
|-------------------|---------------------------------------------------|
| Dockerfile        | Defines the environment for the services (master, slave, HAProxy) |
| HAProxy           | Load balances traffic between master and slave MySQL servers |
| `mysql.conf.cnf`  | MySQL configuration for master/slave replication setup |
| `build.sh`        | Automates the setup, including building Docker images, setting up replication, and starting the services |
| `docker-compose.yml` | Orchestrates Docker containers for the app, including MySQL (master & slave) and HAProxy |

---

## 📥 Installation

1. **Create a `conf` folder in both the `master` and `slave` directories:**

   Inside your project, create a folder structure as follows:

2. **Create `mysql.conf.cnf` configuration files**

- In the `master/conf/` directory, create a file named `mysql.conf.cnf` with the following content:

  ```ini
  [mysqld]

  skip-host-cache
  skip-name-resolve

  server-id = 1
  log_bin = /var/log/mysql/mysql-bin.log
  binlog_format = ROW
  binlog_do_db = mydb
  ```

- In the `slave/conf/` directory, create a file named `mysql.conf.cnf` with the following content:

  ```ini
  [mysqld]

  skip-host-cache
  skip-name-resolve

  server-id = 2
  relay-log = /var/log/mysql/mysql-relay-bin.log
  log_bin = /var/log/mysql/mysql-bin.log
  binlog_do_db = mydb
  ```

3. **Open Docker and start the containers**

Make sure Docker is running on your system.

4. **Run the build script**

In the root directory of your project, open a terminal and run the following command:

```bash
./build.sh

