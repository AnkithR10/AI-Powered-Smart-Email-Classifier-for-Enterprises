export const emails = [
    {
        id: "EML-20001",
        sender: "Alice Smith",
        subject: "URGENT: Server is down",
        message: "My entire team is unable to access the production environment. This is a critical blocker. PLEASE HELP IMMEDIATELY!",
        category: "complaint",
        urgency: "high",
        date: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        read: false
    },
    {
        id: "EML-20002",
        sender: "Bob Jones",
        subject: "Billing Discrepancy",
        message: "I noticed an extra $50 charge on my invoice #9876. Can you please explain what this is for?",
        category: "request",
        urgency: "medium",
        date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        read: true
    },
    {
        id: "EML-20003",
        sender: "Charlie Brown",
        subject: "Subscription Cancellation",
        message: "I want to cancel my account effective immediately. The service has not met our expectations.",
        category: "complaint",
        urgency: "high",
        date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
        read: false
    },
    {
        id: "EML-20004",
        sender: "Diana Prince",
        subject: "Enterprise Quote Request",
        message: "We are interested in moving 100 users to your professional plan. Can you provide a bulk pricing quote?",
        category: "request",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true
    },
    {
        id: "EML-20005",
        sender: "Eve Adams",
        subject: "Password Reset Help",
        message: "I've tried resetting my password three times but haven't received the email. I'm locked out of my account.",
        category: "request",
        urgency: "medium",
        date: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
        read: false
    },
    {
        id: "EML-20006",
        sender: "Frank Castle",
        subject: "Product Demo Request",
        message: "I saw your latest feature release and would love a 15-minute demo to show my team how it works.",
        category: "request",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        read: true
    },
    {
        id: "EML-20007",
        sender: "Grace Lee",
        subject: "Love the new UI!",
        message: "The recent update to the dashboard is fantastic. It's much faster and easier to navigate than before. Great job!",
        category: "feedback",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
        read: true
    },
    {
        id: "EML-20008",
        sender: "Harry Potter",
        subject: "Support Feedback",
        message: "I spoke with Leo from your support team today and he was incredibly helpful. Five stars!",
        category: "feedback",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        read: true
    },
    {
        id: "EML-20009",
        sender: "Xavier Woods",
        subject: "Feature Request: Dark Mode",
        message: "Is there a plan to add a system-wide dark mode for the mobile application? It's a highly requested feature.",
        category: "request",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(),
        read: true
    },
    {
        id: "EML-20010",
        sender: "Marketing Team",
        subject: "Win a $1000 Gift Card",
        message: "CONGRATULATIONS! You've been selected to win a $1000 Amazon Gift Card. Click here to claim your prize now!!!",
        category: "spam",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        read: false
    },
    {
        id: "EML-20011",
        sender: "Crypto News",
        subject: "Next Big Coin: MOON",
        message: "Don't miss out on the next 100x gem. Invest in MOON coin today and watch your wealth grow exponentially.",
        category: "spam",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(),
        read: true
    },
    {
        id: "EML-20012",
        sender: "Security Desk",
        subject: "CRITICAL: Account Compromised",
        message: "We detected an unauthorized login to your account from Russia. Please click here to verify your identity and secure your data.",
        category: "complaint",
        urgency: "high",
        date: new Date(Date.now() - 1000 * 60 * 60 * 110).toISOString(),
        read: false
    },
    {
        id: "EML-20013",
        sender: "Yara Gray",
        subject: "Order #12345 Delayed",
        message: "My order was supposed to arrive last Tuesday, but the tracking still says 'Processing'. Please provide an update.",
        category: "complaint",
        urgency: "medium",
        date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
        read: true
    },
    {
        id: "EML-20014",
        sender: "Zoe Miller",
        subject: "Onboarding Documents",
        message: "Could you please send over the latest employee handbook and onboarding checklist for our new hires starting Monday?",
        category: "request",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 130).toISOString(),
        read: true
    },
    {
        id: "EML-20015",
        sender: "Leo King",
        subject: "Quick Thank You",
        message: "Just wanted to send a quick note of thanks for resolving my technical ticket so quickly. Everything is working perfectly now.",
        category: "feedback",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
        read: true
    },
    {
        id: "EML-20016",
        sender: "DevOps",
        subject: "Alert: High latency on EU server",
        message: "Warning: Response times in the EU region have exceeded 500ms. Investigating root cause.",
        category: "complaint",
        urgency: "high",
        date: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
        read: false
    },
    {
        id: "EML-20017",
        sender: "IT Desk",
        subject: "Software Update: Chrome & Slack",
        message: "Please restart your computer to apply the latest security patches for Chrome and Slack.",
        category: "request",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 160).toISOString(),
        read: true
    },
    {
        id: "EML-20018",
        sender: "Frank Castle",
        subject: "VPN Connection Issues",
        message: "My VPN keeps dropping every 10 minutes. I can't stay connected to the internal database.",
        category: "complaint",
        urgency: "medium",
        date: new Date(Date.now() - 1000 * 60 * 60 * 170).toISOString(),
        read: false
    },
    {
        id: "EML-20019",
        sender: "Accounting",
        subject: "Travel Reimbursement Request",
        message: "Please approve the travel expenses for the Seattle sales trip last week. All receipts are attached.",
        category: "request",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
        read: true
    },
    {
        id: "EML-20020",
        sender: "Finance Team",
        subject: "Q2 Budget Review",
        message: "Final numbers for Q2 are in. We are slightly over budget in the Marketing department but fine overall.",
        category: "request",
        urgency: "low",
        date: new Date(Date.now() - 1000 * 60 * 60 * 190).toISOString(),
        read: true
    }
];
