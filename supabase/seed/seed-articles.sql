-- Seed: 6 existing blog articles (migrated from hardcoded data)
-- Run after migrations are applied.

INSERT INTO content_objects (slug, title, content_type, excerpt, semantic_tags, status, created_by, author_name, published_at, featured_image_url, body) VALUES

('what-is-a-digital-home',
 'What Is a Digital Home? And Why Every Business Needs One by 2027.',
 'article',
 'The gap between businesses with AI-native infrastructure and those still posting-and-praying is widening fast. Here''s where it started.',
 ARRAY['digital-home', 'strategy', 'ai-infrastructure'],
 'published', 'human', 'Luke Carter', '2026-03-10',
 '/blog-digital-home.jpg',
 '<h2>The Old Model Is Broken</h2>
<p>For the last decade, the playbook was simple: build a website, post on social media, run ads, hope for the best. It worked — for a while. But the landscape has shifted so fundamentally that this approach doesn''t just underperform anymore. <strong>It actively works against you.</strong></p>
<p>The businesses still running on this model are stuck in what we call the feast-or-famine cycle. They land a great client, disappear into delivery, and emerge 60 days later to an empty pipeline. Every time.</p>
<blockquote><p>Your website should be more than a brochure. It should be an intelligent system that turns strangers into clients on autopilot.</p></blockquote>
<h2>Enter the Digital Home</h2>
<p>A Digital Home is not a website redesign. It''s a fundamentally different architecture — an owned, AI-native ecosystem that does three things simultaneously:</p>
<ul>
<li><strong>Speaks to humans</strong> — personalised experiences, clear positioning, zero friction.</li>
<li><strong>Speaks to AI agents</strong> — structured data, REST APIs, semantic markup that LLMs can read and recommend.</li>
<li><strong>Speaks to search engines</strong> — dynamic JSON-LD, llms.txt, and entity-based schema that future-proofs your visibility.</li>
</ul>
<p>This isn''t theoretical. The infrastructure exists today. The tools are mature. The only question is whether you build it now — while the gap is still closeable — or wait until the businesses that moved first have made you invisible.</p>
<h2>The Three Layers</h2>
<h3>Layer 1: Foundation</h3>
<p>Your domain, your database, your email list. These are the assets you own. Not rented space on Instagram. Not a Linktree link. Actual digital real estate that no platform can throttle, suspend, or algorithm-strangle.</p>
<h3>Layer 2: Intelligence</h3>
<p>AI connectors — Claude, ChatGPT, custom agents — that plug into your foundation layer and add autonomous capability. Lead scoring, content generation, personalised nurture sequences. The "smart tissue" that makes the system run without you.</p>
<h3>Layer 3: Engine</h3>
<p>The autonomous agents that actually operate the system. A content agent that writes and publishes. An SEO agent that optimises and maintains your knowledge graph. An email agent that nurtures leads through sequences. A personalisation engine that adapts the experience for every visitor.</p>
<blockquote><p>The businesses that build their AI-native infrastructure today will be the ones that AI recommends tomorrow.</p></blockquote>
<h2>Why 2027 Is the Deadline</h2>
<p>AI discovery is replacing traditional search. Perplexity, SearchGPT, and Claude are already answering questions that used to go to Google. When someone asks "who''s the best brand strategist for high-ticket consultants," the AI doesn''t scroll through 10 blue links. It makes a recommendation.</p>
<p>If your brand isn''t structured to be read, understood, and confidently recommended by these systems, you won''t be in the conversation. It''s that simple.</p>
<p>The same thing happened when social media replaced traditional advertising. The same thing happened when Google replaced the Yellow Pages. <strong>The ones who moved first won. The ones who waited became cautionary tales.</strong></p>'),

('vibe-marketing-explained',
 'Vibe Marketing: The System That Speaks to Humans and Machines Simultaneously.',
 'article',
 'SEO is changing. Search is changing. Content that only talks to humans is already losing. Here''s how to build for both audiences at once.',
 ARRAY['vibe-marketing', 'seo', 'ai-discovery'],
 'published', 'human', 'Luke Carter', '2026-03-14',
 '/blog-vibe-marketing.jpg',
 '<h2>The Dual-Audience Problem</h2>
<p>Every piece of content you publish now has two audiences: humans and machines. Write only for humans, and AI systems can''t parse or recommend you. Write only for machines, and humans bounce in seconds.</p>
<p>Vibe Marketing is the framework for doing both simultaneously. It''s not a rebrand of content marketing. It''s a fundamentally different approach to how you structure, publish, and distribute information online.</p>
<blockquote><p>Content that only talks to humans is already losing. The future belongs to systems that speak both languages fluently.</p></blockquote>
<h2>The Three Principles</h2>
<ul>
<li><strong>Structured over freeform</strong> — Every content object has semantic tags, entity relationships, and machine-readable metadata. Not as an afterthought. As the foundation.</li>
<li><strong>Owned over rented</strong> — Your content lives on your infrastructure, not someone else''s platform. You control the data, the distribution, and the monetisation.</li>
<li><strong>Autonomous over manual</strong> — AI agents handle the creation pipeline. You set the strategy. The system executes.</li>
</ul>
<h2>How It Works in Practice</h2>
<p>When a Vibe Marketing system publishes an article, it doesn''t just go on a blog. It updates the knowledge graph. It generates JSON-LD for the entities mentioned. It creates internal links to related content objects. It triggers email sequences for relevant segments. It updates the llms.txt file so AI crawlers can index it immediately.</p>
<p>All of this happens autonomously. The human sets the direction. The system does the work.</p>
<h2>The Competitive Advantage</h2>
<p>Most businesses are still doing content marketing the old way: write a blog post, share it on LinkedIn, hope someone reads it. That worked when Google was the only gateway. But now there are dozens of AI systems deciding who to recommend, and <strong>they reward structure, not volume.</strong></p>
<p>One well-structured piece of content in a Vibe Marketing system will outperform fifty blog posts published the traditional way. Not because it''s better written — because it''s better architected.</p>'),

('ai-agents-for-small-business',
 'AI Employees: How to Build a Marketing Department in an Afternoon.',
 'guide',
 'Lucy writes your strategy. Arthur publishes your articles. Roger distributes them. None of them need a salary.',
 ARRAY['ai-agents', 'automation', 'operations'],
 'published', 'human', 'Luke Carter', '2026-03-16',
 '/blog-ai-agents.jpg',
 '<h2>The Marketing Department You Can''t Afford (Until Now)</h2>
<p>A proper marketing operation needs a strategist, a content writer, an SEO specialist, an email marketer, a social media manager, and someone to tie it all together. That''s six salaries. For most consultants and small businesses, that''s a fantasy.</p>
<p>AI agents change the equation entirely. Not chatbots. Not templates. <strong>Autonomous agents</strong> that can research, write, publish, optimise, and distribute — without you managing every step.</p>
<h2>Meet the Team</h2>
<h3>Lucy — The Strategist</h3>
<p>Lucy analyses your content corpus, your competitor landscape, and your SEO data to generate content briefs. She identifies keyword opportunities, maps content to your sales funnel, and prioritises based on impact.</p>
<h3>Arthur — The Publisher</h3>
<p>Arthur takes Lucy''s briefs and writes full articles in your brand voice. He structures them for both human readability and AI indexability. He adds semantic tags, entity relationships, and JSON-LD. Then he publishes directly to your Digital Home.</p>
<h3>Roger — The Distributor</h3>
<p>Roger takes published content and creates distribution assets: email sequences, social snippets, internal links. He updates your knowledge graph and triggers personalised nurture flows for relevant audience segments.</p>
<blockquote><p>None of them need a salary. None of them take holidays. None of them burn out. And they get better at their job every single day.</p></blockquote>
<h2>The Setup</h2>
<ul>
<li><strong>Define your content corpus</strong> — brand voice, positioning, ICP, offers. This is what the agents learn from.</li>
<li><strong>Build your infrastructure</strong> — database, API routes, publishing pipeline. The agents need somewhere to work.</li>
<li><strong>Configure and deploy</strong> — each agent gets a system prompt, access credentials, and a schedule. Then they run.</li>
</ul>
<p>The entire setup takes an afternoon. The return compounds indefinitely.</p>'),

('stop-undercharging-for-consulting',
 'How to Stop Undercharging for Consulting: The Infrastructure Fix.',
 'article',
 'The problem isn''t your rates. It''s that your system lets price-shoppers through the front door. Here''s how to install a filter.',
 ARRAY['pricing', 'lead-qualification'],
 'published', 'human', 'Luke Carter', '2026-03-08',
 '/blog-stop-undercharging.jpg',
 '<h2>It''s Not a Pricing Problem</h2>
<p>Every consultant who has ever felt the sting of a prospect ghosting after hearing the price thinks they have a pricing problem. They don''t. They have a <strong>filtering problem.</strong></p>
<p>When your infrastructure lets anyone through the front door — tire-kickers, price-shoppers, people who found you through a generic Google search — you end up spending 80% of your time on conversations that were never going to convert.</p>
<h2>The Infrastructure Fix</h2>
<p>Premium consultants don''t chase clients. They build systems that attract the right ones and filter out the wrong ones before a single call is booked. The infrastructure does the qualification for you.</p>'),

('feast-or-famine-cycle',
 'The Feast-or-Famine Cycle: Why Experts Stay Broke Between Clients.',
 'article',
 'You land a great client, disappear into delivery, and emerge 60 days later to an empty pipeline. The pattern is predictable — and fixable.',
 ARRAY['pipeline', 'automation'],
 'published', 'human', 'Luke Carter', '2026-03-05',
 '/blog-feast-or-famine.jpg',
 '<h2>The Predictable Pattern</h2>
<p>Land a client. Celebrate. Disappear into delivery for 60 days. Emerge to an empty pipeline. Panic. Hustle. Land another client. Repeat.</p>
<p>This is the feast-or-famine cycle, and it affects virtually every consultant who doesn''t have a system running in the background. The problem isn''t that you''re bad at sales. The problem is that <strong>sales stops when delivery starts.</strong></p>
<h2>The System Solution</h2>
<p>The fix isn''t "do more marketing." It''s build infrastructure that markets for you while you deliver. Content that publishes on schedule. Email sequences that nurture leads automatically. A pipeline that fills itself.</p>'),

('llms-txt-seo-strategy',
 'llms.txt: The New Robots.txt for the AI Era.',
 'guide',
 'Google isn''t the only search engine anymore. If your site can''t talk to Perplexity, Claude, and SearchGPT, you''re already losing rankings.',
 ARRAY['seo', 'ai-discovery'],
 'published', 'human', 'Luke Carter', '2026-03-02',
 '/blog-llms-txt.jpg',
 '<h2>The New Discovery Paradigm</h2>
<p>For two decades, SEO meant one thing: optimise for Google. But the search landscape has fractured. Perplexity, Claude, SearchGPT, and a growing list of AI assistants are now answering the questions that used to drive traffic through Google''s blue links.</p>
<p>These AI systems don''t crawl and index the way Google does. They need structured, machine-readable information. And the emerging standard for providing that is <strong>llms.txt</strong>.</p>
<h2>What Is llms.txt?</h2>
<p>Just as robots.txt tells search engine crawlers how to interact with your site, llms.txt tells AI agents what your site offers, how to query it, and what information is available. It''s a discovery protocol for the AI era.</p>')

ON CONFLICT (slug) DO NOTHING;
