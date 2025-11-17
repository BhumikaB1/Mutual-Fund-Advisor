
  # Mutual Fund Analyzer

  This is a code bundle for Mutual Fund Analyzer. 
  Mutual Fund Intelligence Bot
PAN-Based Mutual Fund Fetching • XIRR/CAGR Engine • Rolling Returns • Benchmarking • Auto-Updating Market Data
📌 Overview

The Mutual Fund Intelligence Bot is an advanced financial assistant that helps users analyze their mutual fund investments using their PAN number, performs complete portfolio evaluation, answers basic and advanced MF questions, and compares the portfolio against benchmarks like NIFTY 50 and Sensex 30.

This bot is built for real-time mutual fund intelligence, enabling users to understand their portfolio performance with clarity and accuracy.

🚀 Key Features


🔐 1. PAN-Based Mutual Fund Fetching

User enters PAN number.

Bot fetches all mutual funds linked via APIs (CAMS, KFintech).

If no MF found → return "No mutual funds found for this PAN".

📊 2. Mutual Fund Evaluation Engine

Automatically evaluates every scheme:

Current Value

Profit / Loss

XIRR (annualized return)

CAGR (for lumpsum investments)

Rolling returns (1Y, 3Y, 5Y)

Exit load detection

Tax estimation (STCG/LTCG)

Fund category & AMC information

Risk level (Risk-o-Meter)

📝 3. Basic + Advanced Question Answering

The bot can answer:

Basic Queries

“What is NAV?”

“What is SIP vs Lumpsum?”

“What is a small-cap fund?”

Advanced Queries

“Is this fund good for long-term wealth creation?”

“Show XIRR for all my funds.”

“Should I exit this fund?”

“Compare my portfolio with NIFTY 50.”

“Give rolling returns for each fund.”

“Rank my mutual funds.”

📈 4. Benchmark Comparison

The bot compares user funds with:

NIFTY 50

Sensex 30

Category averages

Best performing funds in the same category

This helps users understand if their chosen fund is performing above or below market benchmarks.

🔄 5. Automatic Market Data Fetching

The bot periodically fetches:

NIFTY 50 data

Sensex 30 market data

Fund category benchmarks

Updated ratings (Morningstar, Value Research)

Quarterly/3-month ranking revisions

This ensures accurate and up-to-date analytics.

🧩 6. Modular Query System

The bot supports multiple modes:

Fund Summary Mode – quick overview

Detailed Analytics Mode – XIRR, CAGR, rolling returns

Explanation Mode – explain MF terms in simple words

Recommendation Mode – Buy/Hold/Sell signals (non-financial advice)

📄 7. Portfolio Summary Output

For each fund:

Fund Name

Category & AMC

Ratings & Rankings

XIRR / CAGR

Rolling Returns

Exit Load

Risk Level

Consistency Score

Recommendation (Buy / Hold / Exit)

🤖 8. Bot Personality

Clear and user-friendly communication

Simplifies complex concepts

Gives professional-grade analytics

Includes disclaimers for financial safety

Adjusts complexity based on user knowledge

🛠️ Architecture (High-Level)
User → PAN Input → Fetch MF Data → Evaluation Engine →  
Benchmark Comparator → Response Generator → User


Components:

API Layer (CAMS/KFintech)

MF Evaluation Engine (XIRR, CAGR, rolling returns)

Market Data Layer (NIFTY/Sensex fetching)

Query Understanding (Intent classification)

Recommendation Engine

Benchmark Comparison Module

📦 Tech Stack (Suggested)

Backend: Node.js / Python (FastAPI / Flask)

Bot Platform: Dialogflow CX / Rasa / OpenAI Assistant

Database: MongoDB / PostgreSQL

APIs: CAMS + KFintech, NSE/BSE data sources

Frontend (optional): React / Vue

🧮 Key Calculations
XIRR

Used for SIPs or irregular cashflows.

CAGR

Used for single-lumpsum investments.

Rolling Returns

Measures fund consistency over time.

Exit Load

Based on AMC rules.

Tax Estimator

STCG / LTCG based on fund type and holding period.

Bot:

Fetches funds

Shows list

Offers detailed or basic evaluation

Flow 2: Advanced Query

User:

Give me XIRR of all my funds.


Bot:

Calculates XIRR for each fund

Displays ranking-wise sorted list

Flow 3: Exit Decision

User:

Should I exit my small-cap fund?


Bot:

Analyzes volatility, benchmarks, rolling returns

Gives a data-backed recommendation
(Not financial advice)

⚠️ Disclaimer

This bot provides data-driven analysis only and should not be considered professional financial advice. Users must verify details before making investment decisions.

⭐ Future Enhancements

AI-based risk assessment

Goal-based investment tracking

SIP optimization engine

Personalized asset allocation

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
