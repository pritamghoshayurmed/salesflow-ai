/**
 * API Client utilities for:
 * - Resend (Email sending)
 * - Groq (LLM for personalization & lead scraping)
 * - SerpAPI (Web search for lead discovery)
 */

import Groq from "groq-sdk";

// ============= RESEND EMAIL CLIENT =============
interface ResendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmailViaResend = async (params: ResendEmailParams) => {
  const { to, subject, html, from = "noreply@salesflow.ai" } = params;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
};

// ============= GROQ LLM CLIENT =============

const GROQ_MODEL = "compound-beta";

let cachedGroqClient: Groq | null = null;

const getGroqClient = (): Groq => {
  if (cachedGroqClient) return cachedGroqClient;

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Groq API key is missing. Add VITE_GROQ_API_KEY to your .env file."
    );
  }

  // dangerouslyAllowBrowser is required when running in a Vite/browser context
  cachedGroqClient = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  return cachedGroqClient;
};

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

/**
 * Call Groq with an array of chat messages and return the text response.
 * Drop-in replacement for the previous callOpenRouterLLM / callGeminiLLM calls.
 */
export const callGroqLLM = async (
  messages: ChatMessage[],
  maxTokens = 4000
): Promise<string> => {
  const groq = getGroqClient();

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text?.trim()) {
      throw new Error("No content returned from Groq API");
    }

    return text.trim();
  } catch (error) {
    console.error("Groq API call failed:", error);
    throw error;
  }
};

// Backward-compat aliases — nothing else in the codebase needs to change
export const callGeminiLLM = callGroqLLM;
export const callOpenRouterLLM = callGroqLLM;

interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface LLMAgent {
  send: (message: string, maxTokens?: number) => Promise<string>;
  getHistory: () => AgentMessage[];
  clearHistory: () => void;
}

export const createGroqAgent = (
  systemPrompt = "You are a helpful assistant for B2B sales outreach."
): LLMAgent => {
  const history: AgentMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  return {
    send: async (message: string, maxTokens = 4000) => {
      history.push({ role: "user", content: message });
      try {
        const reply = await callGroqLLM(history, maxTokens);
        history.push({ role: "assistant", content: reply });
        return reply;
      } catch (error) {
        history.pop();
        throw error;
      }
    },
    getHistory: () => [...history],
    clearHistory: () => {
      history.splice(0, history.length, { role: "system", content: systemPrompt });
    },
  };
};

// Backward-compat aliases
export const createGeminiAgent = createGroqAgent;
export const createOpenRouterAgent = createGroqAgent;




// ============= EMAIL PERSONALIZATION =============
export interface PersonalizedEmail {
  subject: string;
  opening: string;
  body: string;
}

export const generatePersonalizedEmail = async (
  leadName: string,
  company: string,
  role: string,
  goalContext: string = "Book a meeting"
): Promise<PersonalizedEmail> => {
  const prompt = `You are an expert B2B sales outreach specialist. Generate a personalized cold email for:
- Lead: ${leadName}
- Company: ${company}
- Role: ${role}
- Goal: ${goalContext}

Create a JSON response with exactly these keys:
{
  "subject": "Professional subject line (max 60 chars)",
  "opening": "Personalized opening line (1-2 sentences)",
  "body": "Email body (2-3 sentences, benefit-focused, ends with CTA)"
}

Keep it professional, benefit-focused, and under 150 words total.
Return ONLY valid JSON, no markdown or extra text.`;

  const response = await callOpenRouterLLM([{ role: "user", content: prompt }]);

  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Failed to parse personalization response:", response);
    throw new Error("Failed to generate personalized email");
  }
};

// ============= WEB SCRAPING HELPERS =============

export interface ScrapingPreferences {
  industry: string;
  jobTitle: string;
  companySize: string;
  location?: string;
  leadsToFind: number;
}

export interface ScrapedLead {
  name: string;
  email: string;
  company: string;
  role: string;
}

/**
 * Step 1: Generate search queries using AI
 */
export const generateSearchQueries = async (
  preferences: ScrapingPreferences
): Promise<string[]> => {
  const {
    industry,
    jobTitle,
    companySize,
    location,
    leadsToFind,
  } = preferences;

  const locationStr = location ? ` in ${location}` : "";
  const prompt = `Generate 5 specific, optimized search queries to find B2B sales leads on LinkedIn and company websites.

Target: ${jobTitle} at ${industry} companies (${companySize})${locationStr}

Requirements:
- Mix of LinkedIn searches and company site searches
- Include variations of job titles
- Target companies by industry type
- Include location if specified

Return ONLY a JSON array of 5 strings (search queries), no other text:
["query1", "query2", "query3", "query4", "query5"]`;

  try {
    const response = await callOpenRouterLLM([{ role: "user", content: prompt }]);

    if (!response) {
      throw new Error("Empty response from LLM");
    }

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error(
        `Could not find JSON array in response. Got: ${response.substring(0, 200)}`
      );
    }

    const queries = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(queries) || queries.length === 0) {
      throw new Error("Search queries array is empty or invalid");
    }

    return queries;
  } catch (err) {
    console.error("Failed to generate search queries:", err);
    throw new Error(
      `Failed to generate search queries: ${err instanceof Error ? err.message : String(err)}`
    );
  }
};

/**
 * Step 2: Search the web using Serper API (google.serper.dev)
 */
export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export const searchWeb = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": import.meta.env.VITE_SERPER_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    const data = await response.json();
    const results: SearchResult[] = (data.organic || [])
      .slice(0, 10)
      .map((r: any) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
      }));

    return results;
  } catch (error) {
    console.error("Web search failed:", error);
    throw error;
  }
};

/**
 * Step 3: Extract lead information from search results using AI
 */
export const extractLeadsFromSearchResults = async (
  searchResults: SearchResult[]
): Promise<ScrapedLead[]> => {
  if (searchResults.length === 0) return [];

  const resultsText = searchResults
    .map(
      (r, i) =>
        `${i + 1}. Title: ${r.title}\nURL: ${r.link}\nSnippet: ${r.snippet}`
    )
    .join("\n\n");

  const prompt = `Extract B2B sales lead information from these search results:

${resultsText}

Extract leads where you can determine: name, company, job role, and email (if available).
For emails, look for patterns like firstname@company.com or check if profile has email info.

Return a JSON array with this structure:
[
  {
    "name": "Full Name",
    "email": "firstname@company.com OR 'not-found'",
    "company": "Company Name",
    "role": "Job Title"
  }
]

Return ONLY valid JSON array, no other text.
If you find 0-2 leads, return few. If 3+ results match, return all relevant ones.`;

  const response = await callOpenRouterLLM([{ role: "user", content: prompt }]);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found");
    const leads = JSON.parse(jsonMatch[0]);
    return Array.isArray(leads) ? leads : [];
  } catch (err) {
    console.error("Failed to parse extracted leads:", response);
    return [];
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email !== "not-found";
};

/**
 * Full scraping pipeline
 */
export const scrapeLeadsFromInternet = async (
  preferences: ScrapingPreferences
): Promise<ScrapedLead[]> => {
  // Step 1: Generate search queries
  console.log("📝 Generating search queries...");
  const queries = await generateSearchQueries(preferences);
  console.log("Found queries:", queries);

  const allLeads: ScrapedLead[] = [];
  const seenEmails = new Set<string>();

  // Step 2 & 3: Search and extract for each query
  for (const query of queries) {
    try {
      console.log(`🔍 Searching for: ${query}`);
      const searchResults = await searchWeb(query);

      if (searchResults.length === 0) {
        console.log("No results found for query");
        continue;
      }

      console.log(`📊 Extracting leads from ${searchResults.length} results...`);
      const extractedLeads = await extractLeadsFromSearchResults(searchResults);

      // Deduplicate
      for (const lead of extractedLeads) {
        if (
          lead.email &&
          isValidEmail(lead.email) &&
          !seenEmails.has(lead.email)
        ) {
          seenEmails.add(lead.email);
          allLeads.push(lead);

          if (allLeads.length >= preferences.leadsToFind) {
            break;
          }
        }
      }

      if (allLeads.length >= preferences.leadsToFind) {
        break;
      }
    } catch (error) {
      console.error(`Error processing query "${query}":`, error);
      continue;
    }
  }

  console.log(`✅ Found ${allLeads.length} unique leads`);
  return allLeads.slice(0, preferences.leadsToFind);
};

// ============= COMPANY RESEARCH FOR PERSONALIZATION =============

export interface CompanyResearch {
  company: string;
  industry: string;
  recentNews: string[];
  challenges: string[];
  marketPosition: string;
  summary: string;
}

/**
 * Research a company to understand challenges, recent news, and market position
 * Used to make emails more relevant and personalized
 */
export const researchCompanyAndChallenges = async (
  companyName: string,
  industry?: string
): Promise<CompanyResearch> => {
  try {
    // Step 1: Search for recent news and company info
    console.log(`🔍 Researching ${companyName}...`);
    const searchQueries = [
      `${companyName} challenges 2025 2026`,
      `${companyName} news recent updates`,
      `${companyName} revenue growth market position`,
    ];

    const searchResults: SearchResult[] = [];
    for (const query of searchQueries) {
      try {
        const results = await searchWeb(query);
        searchResults.push(...results.slice(0, 5));
      } catch (e) {
        console.warn(`Search failed for "${query}":`, e);
      }
    }

    // Step 2: Extract insights using AI
    const resultsText = searchResults
      .map((r, i) => `${i + 1}. ${r.title}\n${r.snippet}`)
      .join("\n\n")
      .substring(0, 2000);

    const prompt = `Analyze this company research and extract key insights:

Company: ${companyName}
${industry ? `Industry: ${industry}` : ""}

Search Results:
${resultsText}

Provide a JSON response with EXACTLY these keys:
{
  "industry": "Primary industry (e.g., SaaS, FinTech, etc)",
  "challenges": ["Top 3 business challenges this company likely faces"],
  "recentNews": ["2-3 recent developments or news items"],
  "marketPosition": "Brief description of their market position",
  "summary": "1-2 sentence summary of what makes this company a good outreach target"
}

Return ONLY valid JSON, no extra text.`;

    const response = await callOpenRouterLLM([{ role: "user", content: prompt }]);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const research = JSON.parse(jsonMatch[0]);
      return {
        company: companyName,
        industry: research.industry || "Unknown",
        challenges: research.challenges || [],
        recentNews: research.recentNews || [],
        marketPosition: research.marketPosition || "Unknown",
        summary: research.summary || "",
      };
    } catch (err) {
      console.error("Failed to parse research:", response);
      // Return default research if parsing fails
      return {
        company: companyName,
        industry: industry || "Unknown",
        challenges: [
          "Scaling operations efficiently",
          "Maintaining revenue growth",
          "Improving sales productivity",
        ],
        recentNews: [],
        marketPosition: "Leading company in their space",
        summary: `${companyName} is a growing company looking to improve their processes.`,
      };
    }
  } catch (error) {
    console.error("Company research failed:", error);
    // Graceful fallback
    return {
      company: companyName,
      industry: industry || "SaaS",
      challenges: ["Scaling operations", "Revenue growth", "Talent retention"],
      recentNews: [],
      marketPosition: "Growing company",
      summary: `${companyName} is a company looking to optimize their operations.`,
    };
  }
};

// ============= ENHANCED PERSONALIZATION WITH RESEARCH =============

export interface EnhancedPersonalizedEmail {
  subject: string;
  body: string;
  hook: string; // The research-based opening hook
  research: CompanyResearch;
}

/**
 * Generate personalized email using company research
 * Much more relevant than basic template filling
 */
export const generatePersonalizedEmailWithResearch = async (
  leadName: string,
  company: string,
  role: string,
  tone: string = "Professional",
  goal: string = "Book a meeting"
): Promise<EnhancedPersonalizedEmail> => {
  const safeLeadName = leadName?.trim() || "there";
  const safeCompany = company?.trim() || "your company";
  const safeRole = role?.trim() || "your role";

  try {
    // Step 1: Research the company
    console.log(`📋 Researching ${safeCompany}...`);
    const research = await researchCompanyAndChallenges(safeCompany);

    // Step 2: Generate personalized email using research
    const challengesStr = research.challenges.slice(0, 2).join(" and ");
    const newsStr =
      research.recentNews.length > 0
        ? `Recent: ${research.recentNews[0]}`
        : `Market position: ${research.marketPosition}`;

    const prompt = `You are an expert B2B sales outreach specialist. Create a highly personalized cold email using this research:

Lead: ${safeLeadName} (${safeRole})
Company: ${safeCompany}
Industry: ${research.industry}
Company Challenges: ${challengesStr}
News/Context: ${newsStr}
Goal: ${goal}
Tone: ${tone}

IMPORTANT: Your email must:
1. Reference something specific about their company (use the research)
2. Connect their likely role-level pain points to a measurable benefit
3. Be 3-4 sentences max
4. Feel personal, not templated
5. End with a specific, easy CTA

Create a JSON response with EXACTLY these keys:
{
  "hook": "Opening sentence that references their company situation (1 sentence)",
  "subject": "Subject line under 60 chars",
  "body": "Full email body (3-4 sentences, no signature)"
}

Return ONLY valid JSON, no markdown.`;

    const response = await callOpenRouterLLM([
      { role: "user", content: prompt },
    ]);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const emailData = JSON.parse(jsonMatch[0]);

      return {
        subject: emailData.subject || `Quick question about ${safeCompany}`,
        body: emailData.body || `Hi ${safeLeadName}, would love to chat.`,
        hook: emailData.hook || research.summary,
        research,
      };
    } catch (err) {
      console.error("Failed to parse email generation:", response);
      throw err;
    }
  } catch (error) {
    console.error("Email generation with research failed:", error);
    // Fallback to basic email
    const basicHook = `Saw ${safeCompany} is doing interesting things in your market.`;
    return {
      subject: `Quick question for ${safeLeadName}`,
      body: `Hi ${safeLeadName},\n\n${basicHook}\n\nWould love to chat about how we can help.\n\nBest`,
      hook: basicHook,
      research: {
        company: safeCompany,
        industry: "Unknown",
        challenges: [],
        recentNews: [],
        marketPosition: "",
        summary: basicHook,
      },
    };
  }
};

// ============= CSV PARSING & PERSISTENCE =============

export interface ParsedLead {
  name: string;
  email: string;
  company: string;
  role: string;
}

/**
 * Parse CSV content and extract leads
 * Expected columns: name, email, company, role (case-insensitive)
 */
export const parseCSV = (csvContent: string): ParsedLead[] => {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());

  // Find column indices (case-insensitive)
  const nameIdx = headers.findIndex((h) => h === "name" || h === "first name" || h === "full name");
  const emailIdx = headers.findIndex((h) => h === "email" || h === "email address" || h === "e-mail");
  const companyIdx = headers.findIndex(
    (h) => h === "company" || h === "organization" || h === "organization name"
  );
  const roleIdx = headers.findIndex(
    (h) => h === "role" || h === "job title" || h === "position" || h === "title"
  );

  if (nameIdx === -1 || emailIdx === -1 || companyIdx === -1 || roleIdx === -1) {
    throw new Error(
      "CSV must include: name, email, company, role columns\n" +
        `Found columns: ${headers.join(", ")}`
    );
  }

  const leads: ParsedLead[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const cells = line.split(",").map((c) => c.trim());

    const name = cells[nameIdx]?.trim();
    const email = cells[emailIdx]?.trim();
    const company = cells[companyIdx]?.trim();
    const role = cells[roleIdx]?.trim();

    // Validate required fields
    if (!name || !email || !company || !role) {
      console.warn(`Skipping row ${i + 1}: missing required fields`);
      continue;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn(`Skipping row ${i + 1}: invalid email format`);
      continue;
    }

    leads.push({ name, email, company, role });
  }

  if (leads.length === 0) {
    throw new Error("No valid leads found in CSV");
  }

  return leads;
};

/**
 * Parse uploaded CSV file
 */
export const parseCSVFile = (file: File): Promise<ParsedLead[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const leads = parseCSV(content);
        resolve(leads);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};

// ============= LOCALSTORAGE PERSISTENCE =============

const STORAGE_KEY = "salesflow_leads";

export interface StoredLead extends ParsedLead {
  id: string; // UUID for unique identification
  importedAt: number; // Timestamp when imported
  source: "csv" | "scraped" | "integration";
}

/**
 * Save leads to localStorage
 */
export const saveLeadsToStorage = (leads: StoredLead[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (error) {
    console.error("Failed to save leads to localStorage:", error);
    throw new Error("Failed to save leads");
  }
};

/**
 * Load leads from localStorage
 */
export const loadLeadsFromStorage = (): StoredLead[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load leads from localStorage:", error);
    return [];
  }
};

/**
 * Clear all leads from localStorage
 */
export const clearLeadsFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear leads from localStorage:", error);
    throw new Error("Failed to clear leads");
  }
};

/**
 * Generate unique ID for lead
 */
export const generateLeadId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============= CSV EXPORT =============

/**
 * Convert leads to CSV format
 */
export const leadsToCSV = (leads: StoredLead[]): string => {
  if (leads.length === 0) return "";

  const headers = ["Name", "Email", "Company", "Role", "Source", "Imported At"];
  const rows = leads.map((lead) => [
    `"${lead.name.replace(/"/g, '""')}"`, // Escape quotes
    `"${lead.email}"`,
    `"${lead.company.replace(/"/g, '""')}"`,
    `"${lead.role.replace(/"/g, '""')}"`,
    lead.source,
    new Date(lead.importedAt).toISOString(),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  return csvContent;
};

/**
 * Download leads as CSV file
 */
export const downloadLeadsAsCSV = (leads: StoredLead[], filename = "leads.csv"): void => {
  try {
    const csv = leadsToCSV(leads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download CSV:", error);
    throw new Error("Failed to download CSV");
  }
};
