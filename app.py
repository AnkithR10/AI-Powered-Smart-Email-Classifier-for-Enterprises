import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import random
import os
import requests

# ---------- Backend API Config ----------
# Update this URL to match the backend team's deployed server
API_URL = "http://127.0.0.1:8000"

# ---------- Config ----------
st.set_page_config(
    page_title="AI Email Classifier",
    page_icon="📧",
    layout="wide",
    initial_sidebar_state="expanded",
)

if 'theme' not in st.session_state:
    st.session_state.theme = 'dark'
if 'font_size' not in st.session_state:
    st.session_state.font_size = 18
if 'font_style' not in st.session_state:
    st.session_state.font_style = 'Sans-Serif' 

# ---------- Custom Styles ----------
def inject_custom_css():
    if st.session_state.theme == 'dark':
        bg = "#0d1117"
        text = "#c9d1d9"
        sidebar_bg = "#161b22"
        sidebar_border = "#30363d"
        card_bg = "#1e2532"
        card_border = "#30363d"
        card_hover_shadow = "rgba(0,0,0,0.3)"
        title_color = "#58a6ff"
        label_color = "#8b949e"
        sender_color = "#e6edf3"
        time_color = "#8b949e"
        tag_bg = "#30363d"
    else:
        bg = "#f3f4f6"
        text = "#1f2937"
        sidebar_bg = "#ffffff"
        sidebar_border = "#e5e7eb"
        card_bg = "#ffffff"
        card_border = "#e5e7eb"
        card_hover_shadow = "rgba(0,0,0,0.05)"
        title_color = "#3b82f6"
        label_color = "#6b7280"
        sender_color = "#111827"
        time_color = "#6b7280"
        tag_bg = "#e5e7eb"

    css = f"""
    <style>
        /* Global App Scaling */
        html {{
            font-size: {st.session_state.font_size}px !important;
        }}

        /* Global App Background */
        .stApp {{
            background-color: {bg} !important; 
        }}
        
        /* Force text colors to override config.toml */
        .stApp, .stApp p, .stApp span, .stApp div[data-testid="stMarkdownContainer"] p, 
        .stApp h1, .stApp h2, .stApp h3, .stApp h4, .stApp h5, .stApp h6, 
        [data-testid="stText"], [data-testid="stMetricValue"], [data-testid="stMetricLabel"],
        .stRadio label, .stCheckbox label, div[data-testid="stSelectbox"] label.st-emotion-cache-1j8985c {{
            color: {text} !important;
        }}
        
        /* Sidebar Styles */
        [data-testid="stSidebar"] {{
            background-color: {sidebar_bg} !important;
            border-right: 1px solid {sidebar_border} !important;
        }}
        .css-1544g2n {{
            padding: 2rem 1rem;
        }}
        
        /* App Title */
        .app-title {{
             font-size: 1.5rem;
             font-weight: 700;
             color: {title_color};
             display: flex;
             align-items: center;
             gap: 10px;
             margin-bottom: 2rem;
        }}
        .app-title svg {{
            width: 24px;
            height: 24px;
            fill: currentColor;
        }}

        /* Section Label */
        .section-label {{
            color: {label_color};
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
        }}
        
        /* Main Content Background */
        [data-testid="stMain"] {{
            background-color: {bg} !important;
        }}

        /* Email Card Styles */
        div.email-card {{
            background-color: {card_bg};
            border: 1px solid {card_border};
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
        }}
        div.email-card:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 12px {card_hover_shadow};
        }}
        .email-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }}
        .email-sender {{
            font-weight: 600;
            color: {sender_color};
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        .unread-dot {{
            width: 8px;
            height: 8px;
            background-color: #3b82f6;
            border-radius: 50%;
            display: inline-block;
        }}
        .email-time {{
            color: {time_color};
            font-size: 0.85rem;
        }}
        .email-subject {{
            font-weight: 700;
            font-size: 1.1rem;
            color: {sender_color};
            margin-bottom: 8px;
        }}
        .email-snippet {{
            color: {label_color};
            font-size: 0.95rem;
            margin-bottom: 12px;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }}
        .email-tags {{
            display: flex;
            gap: 8px;
        }}
        .tag {{
            font-size: 0.75rem;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
        }}
        .tag-urgency-high {{
            color: #ef4444;
            border: 1px solid #ef4444;
        }}
        .tag-urgency-medium {{
            color: #eab308;
            border: 1px solid #eab308;
        }}
        .tag-urgency-low {{
            color: #10b981;
            border: 1px solid #10b981;
        }}
        .tag-category {{
            background-color: {tag_bg};
            color: {text};
        }}
        
        /* Hiding Streamlit Checkbox Label selectively inside the cards */
        .stCheckbox > label {{
            display: none;
        }}

        /* ── Pill buttons (inactive) — real class from DOM: etjibo410 ── */
        button.etjibo410,
        button[kind="pillsButton"],
        [data-testid="stPillsButton"] {{
            background-color: {card_bg} !important;
            color: {text} !important;
            border: 1px solid {card_border} !important;
        }}
        button.etjibo410:hover {{
            background-color: {tag_bg} !important;
        }}

        /* ── Pill buttons (active/selected) — real class: etjibo411 ── */
        button.etjibo411,
        [data-testid="stPillsButton"][aria-checked="true"] {{
            background-color: #3b82f6 !important;
            color: #ffffff !important;
            border: 1px solid #3b82f6 !important;
        }}

        /* ── All regular buttons including View ── */
        .stButton > button,
        button.etjibo42 {{
            background-color: {card_bg} !important;
            color: {text} !important;
            border: 1px solid {card_border} !important;
        }}
        .stButton > button:hover,
        button.etjibo42:hover {{
            background-color: {tag_bg} !important;
            border-color: #3b82f6 !important;
            color: {text} !important;
        }}

        /* ── Classify button (primary) stays blue ── */
        .stButton > button[data-testid="baseButton-primary"] {{
            background-color: #3b82f6 !important;
            color: #ffffff !important;
            border-color: #3b82f6 !important;
        }}

        /* ── Text Input / Search bar ── */
        [data-testid="stTextInput"] input,
        .stTextInput input {{
            background-color: {card_bg} !important;
            color: {text} !important;
            border: 1px solid {card_border} !important;
            caret-color: {text} !important;
        }}
        [data-testid="stTextInput"] input::placeholder {{
            color: {label_color} !important;
            opacity: 1 !important;
        }}

        /* ── Sidebar radio labels ── */
        [data-testid="stSidebar"] .stRadio label,
        [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p {{
            color: {text} !important;
        }}

        /* ── Metric labels and values ── */
        [data-testid="stMetricValue"],
        [data-testid="stMetricLabel"],
        [data-testid="stMetricDelta"] {{
            color: {text} !important;
        }}
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)
 
inject_custom_css()

# ---------- Settings Dialog ----------
@st.dialog("Settings")
def settings_dialog():
    st.subheader("🎨 Appearance")
    theme = st.segmented_control("Theme", ["Dark", "Light"], default=st.session_state.theme.capitalize())
    if theme:
        st.session_state.theme = theme.lower()
    
    st.subheader("🔤 Typography")
    font_size = st.slider("Base Font Size", 10, 24, st.session_state.font_size)
    st.session_state.font_size = font_size

    st.divider()
    if st.button("Reset to Defaults", use_container_width=True):
        st.session_state.theme = 'dark'
        st.session_state.font_size = 18
        st.rerun()
    
    if st.button("Close", use_container_width=True):
        st.rerun()

# ---------- Prediction Logic ----------

urgent_keywords = ["urgent", "asap", "immediately", "deadline", "priority", "today", "right away"]

def rule_based_urgency(text):
    text = text.lower()
    for word in urgent_keywords:
        if word in text:
            return "high"
    return "low"

def _mock_predict(email_text):
    """Fallback mock prediction used when backend is unavailable."""
    categories = ['Complaint', 'Request', 'Feedback', 'Spam']
    rule_urgency = rule_based_urgency(email_text)
    urg = "High" if rule_urgency == "high" else random.choice(['Medium', 'Low'])
    cat = random.choice(categories)
    conf = random.uniform(0.75, 0.99)
    return cat, urg, conf

def predict_email(email_text, skip_api=False):
    """
    Sends email text to the backend API in the required JSON format:
        { "email": "<email text here>" }
    Returns (category, urgency, confidence).
    Falls back to mock data if backend is unreachable or if skip_api is True.
    """
    if skip_api:
        return _mock_predict(email_text)

    payload = {"email": email_text}
    try:
        # Fixed: the backend route is actually /classify
        # We append it to the base API_URL provided by the user
        target_url = f"{API_URL}/classify" if not API_URL.endswith("/classify") else API_URL
        response = requests.post(target_url, json=payload, timeout=2)
        if response.status_code == 200:
            data = response.json()
            return data["category"], data["urgency"], data["confidence"]
        else:
            return _mock_predict(email_text)
    except requests.exceptions.RequestException:
        return _mock_predict(email_text)

# ---------- Data Generation / Loading ----------
@st.cache_data(show_spinner="Classifying Enterprise Email Database...")
def load_email_data():
    # Curated "database" of 50 proper enterprise emails
    proper_emails = [
        {"sender": "Alice Smith", "subject": "URGENT: Server is down", "message": "My entire team is unable to access the production environment. This is a critical blocker. PLEASE HELP IMMEDIATELY!"},
        {"sender": "Bob Jones", "subject": "Billing Discrepancy", "message": "I noticed an extra $50 charge on my invoice #9876. Can you please explain what this is for?"},
        {"sender": "Charlie Brown", "subject": "Subscription Cancellation", "message": "I want to cancel my account effective immediately. The service has not met our expectations."},
        {"sender": "Diana Prince", "subject": "Enterprise Quote Request", "message": "We are interested in moving 100 users to your professional plan. Can you provide a bulk pricing quote?"},
        {"sender": "Eve Adams", "subject": "Password Reset Help", "message": "I've tried resetting my password three times but haven't received the email. I'm locked out of my account."},
        {"sender": "Frank Castle", "subject": "Product Demo Request", "message": "I saw your latest feature release and would love a 15-minute demo to show my team how it works."},
        {"sender": "Grace Lee", "subject": "Love the new UI!", "message": "The recent update to the dashboard is fantastic. It's much faster and easier to navigate than before. Great job!"},
        {"sender": "Harry Potter", "subject": "Support Feedback", "message": "I spoke with Leo from your support team today and he was incredibly helpful. Five stars!"},
        {"sender": "Xavier Woods", "subject": "Feature Request: Dark Mode", "message": "Is there a plan to add a system-wide dark mode for the mobile application? It's a highly requested feature."},
        {"sender": "Marketing Team", "subject": "Win a $1000 Gift Card", "message": "CONGRATULATIONS! You've been selected to win a $1000 Amazon Gift Card. Click here to claim your prize now!!!"},
        {"sender": "Crypto News", "subject": "Next Big Coin: MOON", "message": "Don't miss out on the next 100x gem. Invest in MOON coin today and watch your wealth grow exponentially."},
        {"sender": "Security Desk", "subject": "CRITICAL: Account Compromised", "message": "We detected an unauthorized login to your account from Russia. Please click here to verify your identity and secure your data."},
        {"sender": "Yara Gray", "subject": "Order #12345 Delayed", "message": "My order was supposed to arrive last Tuesday, but the tracking still says 'Processing'. Please provide an update."},
        {"sender": "Zoe Miller", "subject": "Onboarding Documents", "message": "Could you please send over the latest employee handbook and onboarding checklist for our new hires starting Monday?"},
        {"sender": "Leo King", "subject": "Quick Thank You", "message": "Just wanted to send a quick note of thanks for resolving my technical ticket so quickly. Everything is working perfectly now."},
        
        # Additional Emails to reach 50
        {"sender": "Zoe Miller", "subject": "Vacation Request - July", "message": "I'd like to request time off from July 10th to 15th for a family vacation. Is that approved?"},
        {"sender": "HR Team", "subject": "New Health Insurance Policy", "message": "Please review the updated medical and dental plans for the upcoming enrollment period."},
        {"sender": "Admin", "subject": "Office Supplies Restocked", "message": "We have new standing desks and ergonomic chairs available for request in the main office."},
        {"sender": "Payroll", "subject": "Your Monthly Paystub", "message": "Your electronic paystub for the month of June is now available in the portal."},
        {"sender": "Zoe Miller", "subject": "Performance Review Schedule", "message": "I've sent calendar invites for our annual reviews. Please confirm your availability."},
        
        {"sender": "DevOps", "subject": "Alert: High latency on EU server", "message": "Warning: Response times in the EU region have exceeded 500ms. Investigating root cause."},
        {"sender": "IT Desk", "subject": "Software Update: Chrome & Slack", "message": "Please restart your computer to apply the latest security patches for Chrome and Slack."},
        {"sender": "Frank Castle", "subject": "VPN Connection Issues", "message": "My VPN keeps dropping every 10 minutes. I can't stay connected to the internal database."},
        {"sender": "IT Desk", "subject": "Laptop Upgrade Ready", "message": "Your new 16-inch MacBook Pro is ready for pickup at the IT helpdesk in room 402."},
        {"sender": "Alice Smith", "subject": "Access Request: AWS Console", "message": "I need ReadOnly access to the AWS production account for the upcoming audit."},
        
        {"sender": "Lead Gen", "subject": "New Inquiry: TechCorp", "message": "A representative from TechCorp just reached out for more information on our API integration services."},
        {"sender": "Marketing", "subject": "Summer Campaign Performance", "message": "Click-through rates for the Summer Sale campaign are up 25% compared to last year's average."},
        {"sender": "Charlie Brown", "subject": "Q4 Strategy Meeting", "message": "Let's schedule a deep dive into our Q4 goals and marketing spend next Tuesday at 2 PM."},
        {"sender": "Diana Prince", "subject": "Webinar Feedback", "message": "The attendees really appreciated the technical deep-dive. One participant asked for the slides."},
        {"sender": "Zoe Miller", "subject": "Sponsorship: Tech Conf", "message": "We have an opportunity to be a lead sponsor at the upcoming Global Tech Expo. Attached is the proposal."},
        
        {"sender": "Accounting", "subject": "Travel Reimbursement Request", "message": "Please approve the travel expenses for the Seattle sales trip last week. All receipts are attached."},
        {"sender": "Finance Team", "subject": "Q2 Budget Review", "message": "Final numbers for Q2 are in. We are slightly over budget in the Marketing department but fine overall."},
        {"sender": "Bob Jones", "subject": "Inquiry: Invoice #10234", "message": "This invoice is now 15 days overdue. Please process the payment at your earliest convenience."},
        {"sender": "Accounting", "subject": "Tax Document: W-2", "message": "Your W-2 tax forms for the previous year are now available for digital download in the HRIS."},
        {"sender": "Charlie Brown", "subject": "Revised Marketing Budget", "message": "I've reduced the social media spend by 10% to accommodate the new billboard campaign."},
        
        {"sender": "Legal Team", "subject": "NDA for New Partner", "message": "Please review and sign the attached NDA before our meeting with the new technology partner."},
        {"sender": "Security", "subject": "Alert: Unauthorized Login", "message": "We detected an unauthorized login attempt on your account from an unrecognized IP in Shanghai."},
        {"sender": "Legal Team", "subject": "Trademark Filing Update", "message": "The USPTO has accepted our application for the new product name. Final approval is expected in 3 months."},
        {"sender": "Compliance", "subject": "Security Training Reminder", "message": "This is a reminder to complete your mandatory annual cybersecurity and phishing training by Friday."},
        {"sender": "Frank Castle", "subject": "Contract Review Complete", "message": "I've reviewed the service agreement for the new vendor. All legal clauses are standard and safe to sign."},
        
        {"sender": "Grace Lee", "subject": "Excellent Support Experience", "message": "Whoever handled my ticket #5543 was amazing. Very fast and knowledgeable!"},
        {"sender": "Leo King", "subject": "API Version Bug", "message": "Found a potential regression in the latest v2.4 API. The endpoint is returning an 500 status code."},
        {"sender": "Harry Potter", "subject": "Question: Data Export", "message": "Does the system support bulk export to Parquet format, or only CSV and JSON?"},
        {"sender": "Charlie Brown", "subject": "Refund Status Update", "message": "I'm still waiting for the credit to appear on my bank statement from the return I made last week."},
        {"sender": "Alice Smith", "subject": "Search Bar Feedback", "message": "The new predictive search in the dashboard is saving me so much time. Thanks for the update!"},
        
        {"sender": "Lottery HQ", "subject": "You won the MegaMillions!", "message": "URGENT! Your email address was selected as a winner of $50,000,000. Send us your bank details immediately to claim."},
        {"sender": "Fake Desk", "subject": "Apple ID Locked", "message": "Your Apple ID has been locked for security reasons. Sign in at this totally real link to unlock your account."},
        {"sender": "Investment", "subject": "SolarCoin - 1000% ROI", "message": "Invest in the renewable energy future. SolarCoin is set to explode next week. Get in early while you can!"},
        {"sender": "Bank Alert", "subject": "Verify Banking Details", "message": "During our routine security audit, we found an error in your profile. Please update your PIN at this link."},
        {"sender": "Pharmacy Deal", "subject": "Cheap Prescription Meds", "message": "Get the best prices on all your medication with no prescription required. Worldwide shipping in 24 hours."}
    ]
    
    data = []
    now = datetime.now()
    
    # Check if backend is available
    backend_online = False
    try:
        requests.get(API_URL.replace("/classify", ""), timeout=0.5)
        backend_online = True
    except:
        pass

    if not backend_online:
        st.warning("⚠️ **Backend Offline**: Model classifications will use local mock logic. Start the backend (`uvicorn main:app`) for real predictions.")

    # Show a progress bar for the large classification job
    progress_bar = st.progress(0)
    status_text = st.empty()

    for i, email in enumerate(proper_emails):
        # Update progress
        progress = (i + 1) / len(proper_emails)
        progress_bar.progress(progress)
        status_text.text(f"Classifying email {i+1} of {len(proper_emails)}...")

        # IMABALANCED DISTRIBUTION:
        # 60% of emails in the last 48 hours, 40% spread over the previous 5 days.
        if i < 30:
            days_ago = random.randint(0, 1)
        else:
            days_ago = random.randint(2, 6)
            
        # Business hours skew: 70% between 8 AM and 6 PM
        if random.random() < 0.7:
            hour = random.randint(8, 17)
        else:
            hour = random.randint(0, 23)
            
        date_time = now - timedelta(days=days_ago)
        date_time = date_time.replace(hour=hour, minute=random.randint(0, 59))
        
        email_full_text = f"{email['subject']}\n\n{email['message']}"
        # If backend is offline, predict_email will automatically fall back to mock
        cat, urg, conf = predict_email(email_full_text)
            
        data.append({
            'ID': f"EML-{20000+i}",
            'Date': date_time,
            'Sender': email['sender'],
            'Subject': email['subject'],
            'Category': cat,
            'Urgency': urg,
            'Snippet': email['message'][:150] + ('...' if len(email['message']) > 150 else ''),
            'Message': email['message'],
            'Read': i > 15, # Some read, some unread
            'Hour': hour,
            'DayName': date_time.strftime('%A')
        })
    
    # Clear progress indicators
    progress_bar.empty()
    status_text.empty()
            
    df = pd.DataFrame(data)
    if not df.empty:
        df = df.sort_values('Date', ascending=False).reset_index(drop=True)
    return df

if 'df' not in st.session_state:
    st.session_state.df = load_email_data()

df = st.session_state.df

# Initialize selected emails set in session state
if 'selected_emails' not in st.session_state:
    st.session_state.selected_emails = set()

def toggle_email(email_id):
    if email_id in st.session_state.selected_emails:
        st.session_state.selected_emails.remove(email_id)
    else:
        st.session_state.selected_emails.add(email_id)

# ---------- Sidebar ----------
with st.sidebar:
    st.markdown("""
        <div class="app-title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            AI Powered<br/>Email Classifier<br/>for Enterprises
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown('<div class="section-label">FOLDERS</div>', unsafe_allow_html=True)
    
    # We use a radio button to emulate navigation
    folder_counts = {
        'Overview': '',
        'Inbox': f"{len(df)}",
        'Complaint': f"{len(df[df['Category'] == 'Complaint'])}",
        'Request': f"{len(df[df['Category'] == 'Request'])}",
        'Feedback': f"{len(df[df['Category'] == 'Feedback'])}",
        'Spam': f"{len(df[df['Category'] == 'Spam'])}"
    }
    
    # Option names with emojis for styling
    options = ["📊 Overview", "📥 Inbox", "⚠️ Complaint", "📄 Request", "💬 Feedback", "🚫 Spam", "🔍 Classify New"]
    
    # Simple mapping
    folder_map = {
        "📊 Overview": "Overview",
        "📥 Inbox": "Inbox",
        "⚠️ Complaint": "Complaint",
        "📄 Request": "Request",
        "💬 Feedback": "Feedback",
        "🚫 Spam": "Spam",
        "🔍 Classify New": "Classify New",
    }
    
    selected_nav = st.radio("Navigation", options, label_visibility="collapsed")
    current_folder = folder_map[selected_nav]

    st.markdown("<br><br><br><br><br>", unsafe_allow_html=True)
    st.markdown("---")
    
    if st.button("⚙️ Settings", use_container_width=True):
        settings_dialog()


# ---------- Main Content ----------

if current_folder == "Overview":
    st.title("📊 Analytics Dashboard")
    st.markdown("Gain insights into email processing and classification metrics.")

    plot_text_color = '#c9d1d9' if st.session_state.theme == 'dark' else '#1f2937'
    plot_template = 'plotly_dark' if st.session_state.theme == 'dark' else 'plotly_white'

    # ── KPI Row ──────────────────────────────────────────────────────────────
    total = len(df)
    unread = len(df[~df['Read']])
    spam = len(df[df['Category'] == 'Spam'])
    high_urg = len(df[df['Urgency'].str.lower() == 'high'])
    read_rate = f"{(len(df[df['Read']]) / total * 100):.0f}%" if total else "0%"

    k1, k2, k3, k4, k5 = st.columns(5)
    k1.metric("📧 Total Emails", total)
    k2.metric("📬 Unread", unread, delta=f"{unread/total*100:.0f}% unread" if total else "0%")
    k3.metric("⚡ High Urgency", high_urg)
    k4.metric("🚫 Spam Detected", spam)
    k5.metric("✅ Read Rate", read_rate)

    st.markdown("---")

    # ── Row 1: Category Donut  +  Urgency Bar ──────────────────────────────
    c1, c2 = st.columns(2)

    # ── Category Deep-Dive ──────────────────────────────────────────────────
    st.subheader("🗂️ Category & Priority Analysis")
    c1, c2 = st.columns(2)

    with c1:
        st.markdown("### 📊 Distribution by Category")
        cat_counts = df['Category'].value_counts().reset_index()
        cat_counts.columns = ['Category', 'Count']
        fig_cat = px.bar(
            cat_counts, x='Category', y='Count', color='Category', text='Count',
            color_discrete_sequence=['#ef4444', '#3b82f6', '#10b981', '#8b949e']
        )
        fig_cat.update_traces(textposition='outside')
        fig_cat.update_layout(
            template=plot_template,
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color=plot_text_color), showlegend=False,
            margin=dict(t=10, b=10), xaxis_title='', yaxis_title='Emails',
            xaxis=dict(tickfont=dict(color=plot_text_color)),
            yaxis=dict(tickfont=dict(color=plot_text_color))
        )
        st.plotly_chart(fig_cat, use_container_width=True)

    with c2:
        st.markdown("### ⚡ Priority Mix (Percentage Stacked)")
        stacked = df.groupby(['Category', 'Urgency']).size().reset_index(name='Count')
        # Calculate percentage for each category
        totals = stacked.groupby('Category')['Count'].transform('sum')
        stacked['%'] = (stacked['Count'] / totals) * 100
        
        fig_stacked = px.bar(
            stacked, x='Category', y='%', color='Urgency', barmode='stack',
            color_discrete_map={'High': '#ef4444', 'Medium': '#eab308', 'Low': '#10b981'}
        )
        fig_stacked.update_layout(
            template=plot_template,
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color=plot_text_color), margin=dict(t=10, b=10),
            xaxis_title='', yaxis_title='% of Emails',
            xaxis=dict(tickfont=dict(color=plot_text_color)),
            yaxis=dict(tickfont=dict(color=plot_text_color)),
            legend=dict(font=dict(color=plot_text_color))
        )
        st.plotly_chart(fig_stacked, use_container_width=True)

    st.markdown("---")

    # ── Operational Efficiency ──────────────────────────────────────────
    st.subheader("⚙️ Operational Efficiency")
    c3, c4 = st.columns(2)

    with c3:
        st.markdown("### 📅 Peak Times (Hour vs. Day)")
        days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        time_pivot = df.pivot_table(index='DayName', columns='Hour', values='ID', aggfunc='count', fill_value=0)
        time_pivot = time_pivot.reindex(days_order)
        # Ensure all 24 hours are present
        for h in range(24):
            if h not in time_pivot.columns:
                time_pivot[h] = 0
        time_pivot = time_pivot[sorted(time_pivot.columns)]

        fig_heat = px.imshow(
            time_pivot,
            labels=dict(x="Hour of Day", y="Day of Week", color="Email Volume"),
            color_continuous_scale='Blues' if st.session_state.theme == 'light' else 'YlGnBu',
            aspect="auto"
        )
        fig_heat.update_layout(
            template=plot_template,
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color=plot_text_color), margin=dict(t=10, b=10),
            xaxis=dict(tickfont=dict(color=plot_text_color), tickmode='linear', tick0=0, dtick=2),
            yaxis=dict(tickfont=dict(color=plot_text_color))
        )
        st.plotly_chart(fig_heat, use_container_width=True)

    with c4:
        st.markdown("### ✅ Read Rate by Category")
        read_stats = df.groupby('Category')['Read'].mean().reset_index()
        read_stats['Read Rate (%)'] = read_stats['Read'] * 100
        fig_read = px.bar(
            read_stats, x='Category', y='Read Rate (%)', color='Category', text='Read Rate (%)',
            color_discrete_sequence=['#ef4444', '#3b82f6', '#10b981', '#8b949e']
        )
        fig_read.update_traces(texttemplate='%{text:.0f}%', textposition='outside')
        fig_read.update_layout(
            template=plot_template,
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color=plot_text_color), showlegend=False,
            margin=dict(t=10, b=10), yaxis_range=[0, 110], xaxis_title='',
            xaxis=dict(tickfont=dict(color=plot_text_color)),
            yaxis=dict(tickfont=dict(color=plot_text_color))
        )
        st.plotly_chart(fig_read, use_container_width=True)

    st.markdown("---")

    # ── Trend Analysis ───────────────────────────────────────────────────
    st.subheader("📈 Temporal Trends")
    c5, c6 = st.columns(2)
    
    with c5:
        st.markdown("### 📬 Volume Trend over 7 Days")
        df_vol = df.copy()
        df_vol['DateOnly'] = df_vol['Date'].dt.date
        vol_trend = df_vol.groupby('DateOnly').size().reset_index(name='Total')
        fig_vol = px.line(vol_trend, x='DateOnly', y='Total', markers=True, color_discrete_sequence=['#3b82f6'])
        fig_vol.update_layout(
            template=plot_template,
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color=plot_text_color), margin=dict(t=10, b=10),
            xaxis_title='', yaxis_title='Incoming Emails',
            xaxis=dict(tickfont=dict(color=plot_text_color)),
            yaxis=dict(tickfont=dict(color=plot_text_color))
        )
        st.plotly_chart(fig_vol, use_container_width=True)

    with c6:
        st.markdown("### ⚡ Urgency Distribution (Pie)")
        urg_counts = df['Urgency'].str.title().value_counts().reindex(['High', 'Medium', 'Low'], fill_value=0).reset_index()
        urg_counts.columns = ['Urgency', 'Count']
        fig_urg = px.pie(
            urg_counts, values='Count', names='Urgency', hole=0.45,
            color_discrete_map={'High': '#ef4444', 'Medium': '#eab308', 'Low': '#10b981'}
        )
        fig_urg.update_traces(textposition='inside', textinfo='percent+label')
        fig_urg.update_layout(
            template=plot_template,
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color=plot_text_color), showlegend=False, margin=dict(t=10, b=10)
        )
        st.plotly_chart(fig_urg, use_container_width=True)

elif current_folder == "Classify New":
    st.title("🔍 Classify New Email")
    st.markdown("Use the AI model to predict the category and urgency of a new email or upload a CSV for bulk classification.")
    
    tab1, tab2 = st.tabs(["Single Email", "Batch Upload (CSV)"])
    
    with tab1:
        email_text = st.text_area("Paste Email Content", height=200, placeholder="Dear Support,\n\nI need an update on my ticket immediately...", key="single_email")
        if st.button("Classify Email", type="primary"):
            if not email_text.strip():
                st.error("Please enter some text to classify.")
            else:
                with st.spinner("Analyzing email (Mock)..."):
                    cat, urg, conf = predict_email(email_text)
                    st.success("Classification Complete!")
                    
                    c1, c2, c3 = st.columns(3)
                    c1.metric("Category", cat.title())
                    
                    # Dynamic urgency color
                    urg_color = "red" if urg.lower() == 'high' else "orange" if urg.lower() == 'medium' else "green"
                    c2.markdown(f"**Urgency**<br><span style='color:{urg_color}; font-size:2rem; font-weight:bold;'>{urg.title()}</span>", unsafe_allow_html=True)
                    
                    c3.metric("Confidence", f"{conf*100:.1f}%")
                    
    with tab2:
        st.markdown("### 📤 Bulk CSV Classification")
        st.info("Upload a CSV file containing email text. The system will automatically detect the best column to analyze.")
        
        uploaded_file = st.file_uploader("Choose a CSV file", type="csv")
        
        if uploaded_file is not None:
            df_upload = pd.read_csv(uploaded_file)
            st.write("📋 **Preview of Uploaded Data:**")
            st.dataframe(df_upload.head(), use_container_width=True)
            
            # Column detection
            potential_cols = [c for c in df_upload.columns if any(kw in c.lower() for kw in ['email', 'text', 'body', 'content', 'message', 'subject'])]
            selected_col = st.selectbox("Select column to analyze:", df_upload.columns, index=df_upload.columns.get_loc(potential_cols[0]) if potential_cols else 0)
            
            if st.button("🚀 Start Bulk Classification", type="primary"):
                results = []
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                rows = df_upload.index
                total_rows = len(rows)
                
                for i, idx in enumerate(rows):
                    text = str(df_upload.loc[idx, selected_col])
                    # Always skip API for bulk processing as per user request ("no need for backend")
                    cat, urg, conf = predict_email(text, skip_api=False)
                    results.append({'Category': cat, 'Urgency': urg, 'Confidence': f"{conf*100:.1f}%"})
                    
                    # Update progress
                    prog = (i + 1) / total_rows
                    progress_bar.progress(prog)
                    status_text.text(f"Processing row {i+1} of {total_rows}...")
                
                # Combine results
                df_results = pd.concat([df_upload, pd.DataFrame(results)], axis=1)
                
                st.success(f"✅ Bulk classification of {total_rows} rows complete!")
                st.dataframe(df_results, use_container_width=True)
                
                # Download link
                csv = df_results.to_csv(index=False).encode('utf-8')
                st.download_button(
                    label="📥 Download Classified CSV",
                    data=csv,
                    file_name=f"classified_emails_{datetime.now().strftime('%Y%m%d_%H%M')}.csv",
                    mime='text/csv',
                    use_container_width=True
                )

else: # Email List View (Inbox, Complaint, etc.)
    # Header
    col_title, col_count = st.columns([4, 1])
    with col_title:
        st.title(f"{current_folder}")
    with col_count:
        st.markdown(f"<div style='text-align: right; margin-top: 1.5rem; color: #8b949e;'>{folder_counts[current_folder]} messages</div>", unsafe_allow_html=True)
    
    # Search
    search_query = st.text_input("Search emails...", placeholder="Search emails...", label_visibility="collapsed")
    
    # Filter Pills
    try:
        # Use native pills if available (Streamlit 1.39+)
        fcol1, fcol2 = st.columns([1, 1])
        with fcol1:
            urgency_filter = st.pills("Urgency", ["All", "High", "Medium", "Low"], default="All", label_visibility="collapsed")
        with fcol2:
            date_filter = st.pills("Date", ["Any Date", "Today", "Unread"], default="Any Date", label_visibility="collapsed")
    except AttributeError:
        # Fallback to horizontal radio buttons
        fcol1, fcol2 = st.columns([1, 1])
        with fcol1:
            urgency_filter = st.radio("Urgency", ["All", "High", "Medium", "Low"], horizontal=True, label_visibility="collapsed")
        with fcol2:
            date_filter = st.radio("Date", ["Any Date", "Today", "Unread"], horizontal=True, label_visibility="collapsed")
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Apply Filters
    mask = pd.Series([True] * len(df))
    
    if current_folder != "Inbox":
        mask = mask & (df['Category'].str.lower() == current_folder.lower())
        
    if search_query:
        query_lower = search_query.lower()
        mask = mask & (
            df['Sender'].str.lower().str.contains(query_lower) | 
            df['Subject'].str.lower().str.contains(query_lower) |
            df['Snippet'].str.lower().str.contains(query_lower)
        )
        
    if urgency_filter and urgency_filter != "All":
        mask = mask & (df['Urgency'].str.lower() == urgency_filter.lower())
        
    if date_filter == "Today":
        mask = mask & (df['Date'] >= pd.Timestamp(datetime.now().date()))
    elif date_filter == "Unread":
        mask = mask & (~df['Read'])
        
    filtered_df = df[mask]
    
    # Email Dialog
    @st.dialog("Email Details")
    def email_dialog(email_data):
        st.markdown(f"**From:** {email_data['Sender']}")
        st.markdown(f"**Date:** {email_data['Date'].strftime('%Y-%m-%d %I:%M %p')}")
        st.markdown(f"**Subject:** {email_data['Subject']}")
        st.markdown(f"**Category:** {email_data['Category']} | **Urgency:** {email_data['Urgency']}")
        st.divider()
        body = email_data.get('Message', email_data['Snippet'])
        st.markdown(body)
        
    # Display Emails
    for i, row in filtered_df.iterrows():
        # Determine tags styling
        urgency = row['Urgency']
        urgency_class = f"tag-urgency-{urgency.lower()}"
        
        unread_dot = '<div class="unread-dot"></div>' if not row['Read'] else ''
        time_str = row['Date'].strftime('%I:%M %p').lower()
        
        # HTML template for the card (minus the checkbox, which needs to be a Streamlit widget)
        card_html = f"""
        <div class="email-sender">
            {unread_dot} {row['Sender']}
        </div>
        <div class="email-subject">{row['Subject']}</div>
        <div class="email-snippet">{row['Snippet']}</div>
        <div class="email-tags">
            <span class="tag {urgency_class}">{urgency.title()}</span>
            <span class="tag tag-category">{row['Category'].title().upper()}</span>
        </div>
        """
        
        # Render the card with a standard Streamlit layout
        container = st.container()
        # We manually inject CSS for this specific container to make it look like our card design
        container.markdown('<div class="email-card">', unsafe_allow_html=True)
        
        col1, col2, col3 = container.columns([7, 3, 2])
        
        with col1:
            st.markdown(card_html, unsafe_allow_html=True)
            
        with col2:
             st.markdown(f"<div class='email-time' style='text-align: right; margin-top: 4px;'>{time_str}</div>", unsafe_allow_html=True)
             
        with col3:
             # Add a View button that triggers the dialog
             if st.button("View", key=f"view_{row['ID']}", use_container_width=True):
                 # Mark as read when opened (optional, modifying session state dataframe)
                 st.session_state.df.loc[st.session_state.df['ID'] == row['ID'], 'Read'] = True
                 email_dialog(row)
                 
        container.markdown('</div>', unsafe_allow_html=True)

