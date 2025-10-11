import { query } from '../src/config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await query(
      `INSERT INTO users (email, password, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE SET password = $2
       RETURNING id`,
      ['test@martinplusplus.com', hashedPassword, 'Test User']
    );
    const userId = userResult.rows[0].id;
    console.log('✅ Created test user');

    // Seed emails
    const emails = [
      {
        subject: 'ADIPEC Conference - Agenda',
        sender: 'Sarah Johnson',
        sender_email: 'sarah.j@adipec.com',
        body: 'Hi team, attached is the final agenda for ADIPEC 2025...',
        preview: 'Hi team, attached is the final agenda for ADIPEC 2025. Please review and confirm your attendance.',
        category: 'important',
      },
      {
        subject: 'Billing Issue - Account $2.45',
        sender: 'Finance Team',
        sender_email: 'finance@company.com',
        body: 'Your recent payment of $2.45 requires attention...',
        preview: 'Your recent payment of $2.45 requires attention. Please update your payment method.',
        category: 'actionable',
      },
      {
        subject: 'Weekly Newsletter - Tech Updates',
        sender: 'TechCrunch',
        sender_email: 'newsletter@techcrunch.com',
        body: 'This week in tech: AI breakthroughs, new gadgets...',
        preview: 'This week in tech: AI breakthroughs, new gadgets, and startup funding rounds.',
        category: 'fyi',
      },
    ];

    for (const email of emails) {
      await query(
        `INSERT INTO emails (user_id, subject, sender, sender_email, body, preview, category, received_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '2 hours')`,
        [userId, email.subject, email.sender, email.sender_email, email.body, email.preview, email.category]
      );
    }
    console.log('✅ Seeded emails');

    // Seed events
    const events = [
      {
        title: 'Team Standup',
        description: 'Daily standup meeting',
        start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        end_time: new Date(Date.now() + 5400000).toISOString(), // 1.5 hours from now
        attendees: ['John Doe', 'Jane Smith'],
      },
      {
        title: 'Client Meeting',
        description: 'Quarterly review',
        start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        end_time: new Date(Date.now() + 90000000).toISOString(),
        attendees: ['Sarah Johnson', 'Tom Brown'],
      },
    ];

    for (const event of events) {
      await query(
        `INSERT INTO events (user_id, title, description, start_time, end_time, attendees)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, event.title, event.description, event.start_time, event.end_time, JSON.stringify(event.attendees)]
      );
    }
    console.log('✅ Seeded events');

    // Seed tasks
    const tasks = [
      {
        title: 'Prepare Q4 Report',
        description: 'Quarterly financial report',
        status: 'in_progress',
        priority: 'high',
        progress: 65,
      },
      {
        title: 'Review Design Mockups',
        description: 'UI/UX review',
        status: 'pending',
        priority: 'medium',
        progress: 0,
      },
      {
        title: 'Update Documentation',
        description: 'Technical docs',
        status: 'completed',
        priority: 'low',
        progress: 100,
      },
    ];

    for (const task of tasks) {
      await query(
        `INSERT INTO tasks (user_id, title, description, status, priority, progress)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, task.title, task.description, task.status, task.priority, task.progress]
      );
    }
    console.log('✅ Seeded tasks');

    // Seed chat messages
    const messages = [
      { role: 'assistant', content: "Good morning! I've triaged your inbox. You have 3 important emails requiring attention." },
      { role: 'user', content: 'Summarize the ADIPEC email' },
      { role: 'assistant', content: "The ADIPEC Conference email from Sarah Johnson contains the final agenda for ADIPEC 2025. She's requesting team review and attendance confirmation." },
    ];

    for (const message of messages) {
      await query(
        `INSERT INTO chat_messages (user_id, role, content)
         VALUES ($1, $2, $3)`,
        [userId, message.role, message.content]
      );
    }
    console.log('✅ Seeded chat messages');

    console.log('🎉 Database seeded successfully!');
    console.log('📧 Test user: test@martinplusplus.com');
    console.log('🔑 Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();