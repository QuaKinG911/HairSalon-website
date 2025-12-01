import db from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyMigration() {
    try {
        console.log('Verifying migration...');

        // Read original JSON data
        const jsonPath = path.join(__dirname, '../database.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        const jsonCounts = {
            users: jsonData.users.length,
            services: jsonData.services.length,
            barbers: jsonData.barbers.length,
            bookings: jsonData.bookings.length,
            contact_messages: jsonData.contact_messages.length,
            messages: jsonData.messages.length
        };

        console.log('Original JSON counts:', jsonCounts);

        // Get SQLite counts
        const sqliteCounts = {
            users: (await db.getUsers()).length,
            services: (await db.getServices()).length,
            barbers: (await db.getBarbers()).length,
            bookings: (await db.getBookings()).length,
            contact_messages: (await db.getContactMessages()).length,
            messages: (await db.getMessages()).length
        };

        console.log('SQLite database counts:', sqliteCounts);

        // Compare
        let allMatch = true;
        for (const [key, count] of Object.entries(jsonCounts)) {
            if (count !== sqliteCounts[key]) {
                console.error(`MISMATCH for ${key}: JSON=${count}, SQLite=${sqliteCounts[key]}`);
                allMatch = false;
            }
        }

        if (allMatch) {
            console.log('SUCCESS: All data counts match!');
        } else {
            console.error('FAILURE: Data counts do not match.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyMigration();
