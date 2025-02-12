// test-mongodb-connection.tsx (or test-mongodb-connection.ts if not using JSX)

import { MongoClient, MongoClientOptions } from 'mongodb';

interface MongoDBConnectionDetails {
  host: string;
  port: number;
  database: string;
  user?: string; // Optional user for cases with no authentication (testing)
  password?: string; // Optional password
  tls: boolean;
}

async function testMongoDBConnection(connectionDetails: MongoDBConnectionDetails): Promise<boolean> {
  let client: MongoClient | undefined;

  try {
    let connectionString = `mongodb://${connectionDetails.host}:${connectionDetails.port}/${connectionDetails.database}`;
    if (connectionDetails.user && connectionDetails.password) {
      connectionString = `mongodb://${connectionDetails.user}:${connectionDetails.password}@${connectionDetails.host}:${connectionDetails.port}/${connectionDetails.database}`;
    }
    if (connectionDetails.tls) {
      connectionString += `${connectionString.includes('?') ? '&' : '?'}tls=true`;
    }

    console.log('Attempting to connect to MongoDB with connection string:');
    console.log(connectionString);

    const clientOptions: MongoClientOptions = {}; // You can add more options here if needed, e.g., TLS options

    client = new MongoClient(connectionString, clientOptions);

    await client.connect();
    console.log('Successfully connected to MongoDB server!');

    // Perform a simple operation to verify connection (e.g., ping)
    const pingResult = await client.db().admin().ping();
    console.log('Ping command successful:', pingResult);

    console.log('MongoDB connection test successful!');
    return true;

  } catch (error) {
    console.error('MongoDB connection test failed!');
    console.error('Error details:', error);
    return false;

  } finally {
    if (client) {
      await client.close();
      console.log('Connection closed.');
    }
  }
}

async function main() {
  // **IMPORTANT: Replace these with your actual n8n MongoDB credentials!**
  const dbConnectionDetails: MongoDBConnectionDetails = {
    host: '108.174.58.4', // Replace with your server IP or hostname
    port: 27017,        // Default MongoDB port
    database: 'ashdb',     // Database name from n8n credentials
    user: 'ashdb',         // Username from n8n credentials
    password: 'YOUR_PASSWORD_HERE', // Replace with your actual password from n8n - IMPORTANT!
    tls: true             // Set to true if "Use TLS" is checked in n8n
  };

  // **SECURITY WARNING:**  For testing with disabled authorization, you can try leaving user and password as empty strings:
  // const dbConnectionDetails: MongoDBConnectionDetails = {
  //   host: '108.174.58.4',
  //   port: 27017,
  //   database: 'ashdb',
  //   user: '',
  //   password: '',
  //   tls: true
  // };
  // **BUT REMEMBER TO ENABLE AUTHENTICATION FOR PRODUCTION!**


  console.log('Starting MongoDB connection test...');
  const connectionSuccessful = await testMongoDBConnection(dbConnectionDetails);

  if (connectionSuccessful) {
    console.log('\n--- Connection Test Summary ---');
    console.log('MongoDB connection: SUCCESSFUL');
  } else {
    console.log('\n--- Connection Test Summary ---');
    console.error('MongoDB connection: FAILED. See error details above.');
  }
}

// Run main function if the script is executed directly (not imported as a module)
if (require.main === module) {
  main().catch(console.error);
}

export default testMongoDBConnection; // Export the function for use in other modules