---
template: post
title: "Building MCP Servers for Genealogy: AI-Powered Historical Research"
date: "2026-04-21T16:58:46Z"
excerpt: "Using Claude & MCP servers to enhance genealogy research."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F3ch2earn53443pwxiifw.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F3ch2earn53443pwxiifw.png"
canonical_url: "https://dev.to/raphink/building-mcp-servers-for-genealogy-ai-powered-historical-research-261p"
devto_url: "https://dev.to/raphink/building-mcp-servers-for-genealogy-ai-powered-historical-research-261p"
---
For years now, I’ve been writing a book tracing four family branches across Europe, the Middle East, and South Africa. One thread follows Louis Rau, my 3rd great-uncle, who was president of Compagnie Continentale Edison (CCE) in the early 1900s. He was an Edison Pioneer, part of the inner circle that brought Edison's electrical systems to Europe.

Last year, I found that Thomas Edison's papers were digitized at Rutgers University. So I navigated to [edisondigital.rutgers.edu](http://edisondigital.rutgers.edu), typed "Louis Rau" into the search box, and hit enter, and 847 results were returned.

Somewhere in those 847 documents was the correspondence that would explain Louis Rau's business relationship with Élie Moïse Léon, co-founder of CCE. Somewhere were the letters that traced his movements between Paris and Geneva. Somewhere were the details of CCE's electrical installations across Europe.

But I'd have to click through them one by one, read the snippets, open promising documents, cross-reference dates, take notes, come back later and forget which ones I'd already checked…

A few weeks ago, I started feeding genealogy documents to Claude AI, but that was still pretty tedious, and I kept hitting image upload limits in conversations. And then it clicked: why not build an MCP server, so Claude could perform the search directly?

That question became three MCP servers, a transformed research workflow, and a fundamentally different relationship with historical archives.


# First Win: The Edison Papers MCP

The Edison Papers has an API. I didn't know that initially — I just knew they had a website with a search box. But a quick look at the network tab showed clean REST endpoints returning JSON.

I opened Claude Code and asked it to build an MCP server that wrapped the Edison Papers API. A few hours of iteration later, I had:

- `edison_search`: Query with field-level precision (`creator:"Rau, Louis"`, `recipient:"Léon, Élie"`)
- `edison_get_document`: Retrieve full metadata and transcriptions
- `edison_browse_series`: Navigate document collections systematically
- `edison_get_images`: Access high-resolution scans

{% embed https://github.com/raphink/edison-archive-mcp %}

Now instead of clicking through 847 results, I could ask Claude:

> "Find correspondence where Louis Rau is the creator, dated 1892-1895, mentioning electrical installations or Paris operations."
> 

And Claude would orchestrate the full research pipeline:

1. **Search**: Call Edison Papers MCP → retrieve all matching results
2. **Triage**: Read all abstracts, decide which documents warrant full analysis
3. **Track**: Create a Notion database entry for each document with analysis status
4. **Prioritize**: Rank documents by relevance
5. **Deep read**: For priority documents, get high-resolution images and use OCR for full context
6. **Summary:** Provide a summary of all findings

What would have taken hours of manual clicking, note-taking, and cross-referencing now happens in one conversation.

This was immediately useful. But it surfaced a new problem: where do all these findings go?


# The Organization Problem: Enter Notion MCP

I was already using Notion to organize my research: person profiles, document summaries, research questions. And Claude already had an MCP for Notion.

So now when I asked:

> "Search Edison Papers for Louis Rau correspondence from 1892-1895, create a Notion page summarizing the findings, and link it to Louis Rau's profile."
> 

Claude would:

1. **Search**: Call Edison Papers MCP → retrieve all matching results
2. **Triage**: Read all abstracts, decide which documents warrant full analysis
3. **Track**: Create a Notion database entry for each document with analysis status
4. **Prioritize**: Rank documents by relevance
5. **Deep read**: For priority documents, get high-resolution images and use OCR for full context
6. **Document**: Update Notion pages with findings
7. **Connect**: Update profile pages for people mentioned (Louis Rau, Élie Léon, etc.)

This was amazing. Structured knowledge, automatically organized, all in one conversation.

But then Claude started hallucinating.


# The Hallucination Problem: Claude Needs Ground Truth

Claude would find documents mentioning for example Samuel Léon and Élie Léon, and confidently conclude that they that Samuel was Élie's nephew, completely making it up.

Or it would claim someone was born in 1847 when they were actually born in 1867. Dates off by decades. Family relationships invented wholesale.

The problem: Claude had access to *documents* (via Edison Papers MCP) and *research notes* (via Notion MCP), but not the actual genealogy data. It was inferring family structure from fragmentary mentions in letters and my incomplete notes.

I needed to give Claude access to the tree itself, the actual source of truth about who's related to whom and when they lived.


# Attempt 1: GEDCOM MCP (Local)

My family tree lives in Geni — a collaborative genealogy platform to build a unique World family tree. Geni has an API, but OAuth kept failing when I tried it and I wanted something working *now*.

So I took a shortcut. From time to time, I export data from Geni to GEDCOM (the genealogy standard format), with about 25000 individuals in my export. I used airy10's GEDCOM MCP to make it queryable locally.

{% embed https://github.com/airy10/GedcomMCP %}

This worked! Now Claude could:

- Search for individuals by name
- Verify relationships ("Is X related to Y?")
- Check birth/death dates
- Trace lineage paths

No more hallucinated family connections. The GEDCOM became a **hypothesis database**, and claims in documents could be verified against known family structure.

> **Why Geni as my main database?** 
>
> I use Geni instead of maintaining a private tree because genealogy is collaborative research. Multiple people contribute information, sources get peer-reviewed, duplicates get merged. A tree on Geni is a *shared* knowledge base, not siloed private data that might be duplicated (and wrong) across dozens of individual researchers' files.
> 

But the GEDCOM approach had limitations:

- It only works in Claude Desktop (local MCP)
- It requires manually re-exporting GEDCOM whenever the tree updated
- No access in [claude.ai](http://claude.ai) web sessions (or phone)

I needed the real API.


# Back to Geni: Tackling OAuth

So I went back to the Geni API. A few more hours of iteration with Claude Code, and I had:

- Full OAuth implementation (access tokens, refresh flow)
- 13 tools: profile CRUD, relationship pathfinding, merge candidate detection, family traversal
- Search by name, verify relationships, trace lineage paths programmatically

{% embed https://github.com/raphink/geni-mcp %}

Now I could ask mid-conversation: "Is Samuel Léon related to Élie Moïse Léon?" and get the relationship path instantly, whether I was in Claude Desktop or [claude.ai](http://claude.ai).

The tree became **queryable context** accessible anywhere, not just on my local machine with an up-to-date GEDCOM file.


# Third Server: Newspapers MCP

With Edison Papers and Geni working, I could trace business connections and verify family relationships. But I was still missing contemporary context: how did the *public* see these people? What did newspapers say about CCE's operations? Were there announcements, obituaries, social mentions?

Historical newspapers are digitized across dozens of national archives. Each has its own interface. Searching them all manually meant opening multiple websites, running the same query in different systems, downloading results individually.

So I built a newspapers MCP that:

- Aggregates multiple national newspaper archives
- Searches across collections simultaneously
- Returns snippets as base64-encoded images (because OCR quality varies)

{% embed https://github.com/raphink/newspapers-mcp %}

**Here’s a real example:** 

I asked Claude to search for "Joseph Dreyfus grain Paris 1895" (a grain merchant in the family who had a financial collapse). The MCP found the *concordataire liquidation* announcement in French commercial journals. That single search led to discovering a 90-page Archives de Paris dossier (D14U³/89) I'm still analyzing.

One search. Ten minutes. What would have been days of archive website navigation.



# How They Work Together: Finding Solomon Rau in Munich

Here's a recent example showing how the MCPs orchestrate together:

I asked Claude to search for Solomon Rau's activity in Munich newspapers. The newspapers MCP returned various results, including this advertisement:


![DDSG Announcement](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/3ch2earn53443pwxiifw.png)


This ad showed Solomon Rau advertising the reimbursement of DDSG (Danube Steam Shipping Company) stock — a discovery that:

- Revealed his business activity (financial/stock trading)
- Connected him to DDSG, a major shipping company
- Provided a concrete date and location (Munich)
- Led to further discoveries about other family members' activities

Claude then cross-referenced this against the Geni tree to verify Solomon's identity and relationships, and documented the finding in Notion with the newspaper snippet as a source.

It then correlated it to the DDSG stock that Adolphe Grünberg, Solomon’s son-in-law, had in his post-mortem inventory the next year in 1878, and added another note there.


Have you built AI integration for research yourself? What were your best findings?
