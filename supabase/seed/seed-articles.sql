-- Seed: Example articles
-- These are sample articles to demonstrate the blog functionality.
-- Replace with your own content or delete this file — the AI content pipeline
-- will generate articles for you once the Backend is set up.
-- Run after migrations are applied.

INSERT INTO content_objects (slug, title, content_type, excerpt, semantic_tags, status, created_by, author_name, published_at, body) VALUES

('getting-started-with-your-digital-home',
 'Getting Started With Your Digital Home',
 'article',
 'Your Digital Home is an owned, AI-native ecosystem. Here is what that means and why it matters.',
 ARRAY['digital-home', 'strategy', 'getting-started'],
 'published', 'human', '[YOUR NAME]', now(),
 '<h2>Welcome to Your Digital Home</h2>
<p>This is a sample article to demonstrate how the blog works. It pulls from the Supabase database and renders here automatically.</p>
<p>Once your Backend is set up and your content corpus is filled in, the AI content pipeline will write and publish articles in your voice — on autopilot.</p>
<h2>What to Do Next</h2>
<ul>
<li><strong>Fill in your content corpus</strong> — this is what gives the AI your voice, positioning, and expertise</li>
<li><strong>Set up the Backend</strong> — the operating system that runs the content pipeline</li>
<li><strong>Approve topics in the content calendar</strong> — the AI writes from your approved list</li>
<li><strong>Watch articles appear</strong> — the GitHub Actions workflow publishes daily</li>
</ul>
<p>Delete this sample article once you have real content flowing.</p>')

ON CONFLICT (slug) DO NOTHING;
