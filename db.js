const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Automatically create tables if they don't exist
const init = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      role VARCHAR(20)
    );
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      host_id INT REFERENCES users(id),
      title VARCHAR(200),
      date TIMESTAMP,
      location VARCHAR(200),
      description TEXT,
      capacity INT DEFAULT 100,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS rsvps (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      event_id INT REFERENCES events(id),
      status VARCHAR(20)
    );
  `);
};
init();

module.exports = pool;
