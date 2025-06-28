// MongoDB initialization script
db = db.getSiblingDB('profitra');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { bsonType: 'string' },
        email: { bsonType: 'string' },
        password: { bsonType: 'string' },
        balance: { bsonType: 'number', minimum: 0 }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ isAdmin: 1 });
db.investments.createIndex({ userId: 1, status: 1 });
db.depositrequests.createIndex({ userId: 1, status: 1 });
db.transactions.createIndex({ userId: 1, createdAt: -1 });

print('Database initialized successfully');