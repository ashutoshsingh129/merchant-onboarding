const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

// Migration script to add user_id column to stripe_keys table
const migrateStripeKeysTable = async (client) => {
  try {
    // Check if user_id column already exists
    const columnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'stripe_keys' 
      AND column_name = 'user_id'
    `);
    
    if (columnExists.rows.length === 0) {
      console.log('Adding user_id column to stripe_keys table...');
      
      // Add user_id column
      await client.query(`
        ALTER TABLE stripe_keys 
        ADD COLUMN user_id INTEGER
      `);
      
      // Add foreign key constraint
      await client.query(`
        ALTER TABLE stripe_keys 
        ADD CONSTRAINT fk_stripe_keys_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_stripe_keys_user_active 
        ON stripe_keys(user_id, is_active) 
        WHERE is_active = true
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_stripe_keys_user_id 
        ON stripe_keys(user_id)
      `);
      
      // Drop old index if it exists
      await client.query(`
        DROP INDEX IF EXISTS idx_stripe_keys_active
      `);
      
      console.log('✅ Stripe keys migration completed successfully!');
    } else {
      console.log('ℹ️  user_id column already exists. Migration not needed.');
    }
  } catch (error) {
    console.error('❌ Stripe keys migration failed:', error);
    throw error;
  }
};

// Create users table and add demo users
const setupUsers = async () => {
  const client = await pool.connect();

  try {
    // Start transaction
    await client.query("BEGIN");

    // Create users table
    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Create index for email
    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email 
            ON users(email)
        `);

    // Run Stripe keys migration
    await migrateStripeKeysTable(client);

    // Define users to create
    const users = [
      {
        email: "sal@simplypaymentsgroup.com",
        password: "stripe2025!",
        name: "Admin User",
        role: "admin"
      },
      {
        email: "user1@example.com",
        password: "password123",
        name: "User 1",
        role: "user"
      },
      {
        email: "user2@example.com",
        password: "password123",
        name: "User 2",
        role: "user"
      },
      {
        email: "user3@example.com",
        password: "password123",
        name: "User 3",
        role: "user"
      },
      {
        email: "user4@example.com",
        password: "password123",
        name: "User 4",
        role: "user"
      },
      {
        email: "user5@example.com",
        password: "password123",
        name: "User 5",
        role: "user"
      }
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [userData.email]
      );

      if (existingUser.rows.length === 0) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Insert user
        await client.query(
          "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)",
          [userData.email, hashedPassword, userData.name, userData.role]
        );

        console.log(`✅ User created: ${userData.email} (${userData.name})`);
        createdCount++;
      } else {
        console.log(`ℹ️  User already exists: ${userData.email}`);
        existingCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Created: ${createdCount} users`);
    console.log(`   - Already existed: ${existingCount} users`);
    console.log(`   - Database migrations: Completed`);
    console.log(`\n🔑 Login credentials:`);
    console.log(`   - Admin: sal@simplypaymentsgroup.com / stripe2025!`);
    console.log(`   - Users: user1@example.com to user5@example.com / password123`);

    // Commit transaction
    await client.query("COMMIT");
  } catch (error) {
    // Rollback transaction
    await client.query("ROLLBACK");
    console.error("❌ Error setting up users:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Run the setup
const runSetup = async () => {
  try {
    console.log("🚀 Setting up users table and demo users...");
    await setupUsers();
    console.log("✅ Setup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSetup();
}

module.exports = { setupUsers };
