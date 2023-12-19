---
author: ezzabuzaid
pubDatetime: 2023-09-15T00:00:00Z
pageTitle: A Failed Developer Journey To Start a Startup; The Mistakes And The Product
title: A Failed Developer Journey To Start a Startup; The Mistakes And The Product
heroImage: angular-infinity-scroll
featured: false
draft: true
tags:
  - rxjs
  - angular
description: "Implement Infinity Scroll in Angular using Directive and Pipe and see the pros and cons of each approach."
---

# A Failed Developer Journey To Start a Startup: The Mistakes And The Product.

I didn’t realise it till I was questioning every word I heard: failure, success, feedback, delivery, customer, audience, vertical, entrepreneur, build, market, product, and more.

I didn’t know what to do at the moment. I did follow all the bits of the advice. I wrote notes and kept my name in the folks around me.

They kept telling me to talk to people, know their pain, understand their struggles, and learn about the issues they were willing to spend money to resolve. I was motivated; yes, I can do that; yes, I can talk to people.

_"Hey you, would you pay me if I built XYZ? You sure as heck would."_

The Motivation

A wee past the year before, I started my first official business reading.
“_Growth Hacker Marketing: A Primer on the Future of PR, Marketing, and Advertising_”.

That book, I tell you, was a game-changer for me. It pretty much modelled my current mindset; it is where I learned the concept I’ve grown quite fond of: "Growth Hacking." This concept completely shifted the way I view things.

> Growth hacking is a marketing strategy that emphasises using minimal resources for rapid growth through innovative and cost-effective techniques.

To me, this was more of a **Necessity is the mother of invention.**.

Growth hacking combines creative thinking with unconventional methods to address a problem, utilising minimal resources. Simply put, ever since, I have wanted to solve a problem that requires new, out-of-the-box thinking. Well, I am an engineer, so…

In many years of freelancing and consultation, I found many startups struggle to get their ideas to the first pack of users. Mainly constrained in development intricacies.

_Being a developer myself, that might seem biased, and it most properly is._

My last client wanted a simple interface to queue last-minute orders for the next day. He called me with hesitation.

“You’re the last one I wished to call, and my wish came true.”

“Keeping me in mind, you seem.”

“I had enough with developers, he says. They are either very new or give me ridiculous deadlines. But I didn’t want to call you because you’ll ask for a ridiculous rate”

True, I always ask more than what I think I deserve because I believe that my time after work is twice the value of my normal work time. Besides, _knowing what to do_ is such an underrated thing.

I didn’t take it; I thought I didn’t want to work past 9-5. I wanted to spend those cosy winter nights with my family, screaming at each other.

---

The one thing that keeps my love of programming unmatched is that I know being a developer in this era is one of the ways to make a change as an individual, a good change that can help a lot of people, either directly or indirectly; I just need to be patient.

It struck me the same night that there might be a way to help my local community and hopefully get free from the 9-5 routine (later on, I had to do double the effort; they’re lying to you!)

The problem was dead clear.

1. Entrepreneurs cannot afford developer salaries.
2. And they struggle to find them.

The first thing I did before going to sleep was to write a brief line to describe my yet-to-be solution.

**Validate your product without developers.**

"Can you see the target audience from this statement?"

But, I was so excited that I couldn’t sleep. I kept thinking about the solution, the product, the market, the audience, the money and of course, out of fear, the failure.

How I can do it differently is the questions that kept my mind busy.

I hear you saying: _The phrasing of the questions says it all._
For what it matters, I agree with you.

I waited for the weekend passionately to prepare for the world’s salvation solution. I started looking for existing solutions to understand the reasoning behind their approaches.

Website builders, CMS, AI Products (before the whole ChatGPT thing), And akin.

The trend was infinite. I was surprised by how many people use these kinds of products. Reddit, Twitter and their siblings suggest using no/low-code tools, and to kill the duck in the water, there was a good number of users.

You’d think - I felt good. **No**, rather I felt insecure. Will these products throw me out of the workforce?

Nevertheless, that was good; the market is validated.

I started creating accounts on these platforms: Webflow, Wix, Bubble, and many more. But I didn’t like what I saw; there were too many elements, scattered features, infinite tours, and boring documentation. All these problems didn’t keep the customer from using the platform. I don’t think it is loyalty; on the contrary, they didn’t have other options.

I started to think about that client: Would he agree to use such tools to get the minimum possible amount of work done while searching for a developer?

“Hey, what do you think about that? I asked”
“Seems a good idea, but can’t I just hire someone to do the whole thing and forget about the developer for now? I’m looking to see my users’ first impressions.”
“Sure you can. But you might find it limited.”
“Can’t I just pull the code or manually modify it in place?”

This was the moment that defined what the solution would do: A low-code platform that is minimal by design, not boring, self-explanatory, and most importantly, it can **generate a code** that allows the user to continue the development further, away from the product. (We’ll refer to it as code generation)

That was the first time I called the solution a **product**.

Lean Canvas

The Setup
My first idea was not to use SQL, although my experience says I am very good at it. I decided to use NoSQL so I don’t have to worry much about data modelling. _This was my first regret._

Second, I was too worried about user data; I wanted to build a product that could perfectly produce code from the data. I couldn’t risk having the data in my beholding, so my developer mind decided to use a Multi-Tenant structure, _yet this is not my worst decision._ Yes, I just made it 200% complex, first by working with NoSQL and then by choosing multi-tenancy.

The worst part? I chose **Google Datastore**, something I assumed I was familiar with because it's marketed as the server version of FireStore, but as it turns out, it lacks basic functionalities that SQL has had since before I was even born into this world.

You can say Firebase is 70% of my setup: storage, database, static hosting, serverless, analytics, …etc.

I used GitHub projects to manage user stories with weekly iterations to box my mind around that week’s tickets/tasks. This approach helped me break down the big work into smaller pieces, which, unexpectedly, made me think more precisely about each piece and add more details.

I Need Help

A few months passed, and I was able to do the first successful code generation. The UI is like a big text of code to a developer. The user can create tables, workflows, …etc and the backend server will create an AST representation so that the code generation engine will take care of formulating the files and their content.

At this point, I was so exhausted from the complexity of the UI so that I thought I’d hire someone to help me do some work.

I started listing the important skills

1. Basics of compilers.

I stopped just right here; how the hell can I get someone who knows how a compiler works? I can’t just get anyone and ask them to learn along the way. I was producing results at a 150% rate. Bringing on a developer without prior knowledge in this area would just bog down my productivity.

_To be clear, I was only thinking of hiring people from places I could afford, which limited my chances to almost zero._

You might’ve noticed I said “months” above. They’ll say you shall have your MVP in a matter of weeks. Well, that sounded impossible to me; there was no way on earth I could get an MVP for this problem in a matter of weeks. I already have a full-time job, let alone learning about all other things, Marketing, Sales, Communication, …etc. I was doing more than that, crafting user interviews, extracting patterns, preparing future user stories, roadmap, and more.

Problem 1: Narrow Focus

A few weeks later, I noticed that my design couldn’t scale; I was too focused on serving one app’s needs that I forgot to consider other variations. The solution was too complex, and making changes broke other working stuff. I didn’t write a single test case, and I wasn’t planning to, if you’re thinking that.

> Murphy's law states, "Anything that can go wrong will go wrong."

I knew the current state of the code would never meet what it was supposed to do, so I had to start again. I’m serious; I started again from scratch. This time, I borrowed the idea of extensions from VSCode. A simple concept: A core package that can be extended by user-defined extensions. So, Instead of having a monolith logic, I restructured it so there is the mere base of code in an extension named “Core” that orchestrates the rest of the extensions.

The creative part of this modelling is that the extensions work in a tree-like manner, where the **Core** is the root. For instance, **PostgreSQL** extension/node. It would have **ORM/Client** as a leaf node. This all changed at the end to have the modeling in more of a graph like shape and orphan nodes; Cuz I added the ability to build stuff other than a “WebServer”

To put you in the picture: The recent extension I added as an individual package was for the “Resend Email” product, which, according to my logic, is an orphan extension.

Over Engineering

You know, in life, I've developed a default response for the usual questions I get asked, like "How are you doing?", "Working late tonight?" or similar stuff. So, whenever someone asks, "What's up with the work?" my go-to reply is, "I'm still trying, not sure yet if it's technically feasible." And I'm serious. I really didn't know if my method to solve the problem would work, and even now, there are parts I'm not sure I can handle. Just to clarify, when I say not feasible', I mean given my humble skill set.

A friend of mine keeps telling me I'm over-engineering, but I always shoot back, saying it's not over-engineering because of the technical complexity involved in the solution. Yet, I've come to realize I have been over-engineering, albeit unknowingly. I guess that's what is over-engineering.

See, I’m still confused about this part cuz doing the minimal work at first made me rewrite the code from scratch, yes you can say I’m a shitty developer but still, how you can really know that you’re over engineering when you don’t what is next?

I confess, I've been somewhat of a perfectionist as well, especially when it comes to filling my night mode. I enjoy seeing the function I'm working on not just complete, but also well-crafted and fulfilling its intended purpose. Is that perfectionism? I'm not sure.

The Invisible Co-Founder

I mean, we are 8 billions human by now, right? Yet I couldn’t get new hands.

Throughout 5 months I met 6 folks to discuss the chance of us working together and non lead to an agreement, various reasons but I can frame them this way.

1. Scared: Perhaps I still, I am. I've done my research, sought advice from trusted sources, and read up on the topic. The consensus? Be cautious of taking on a co-founder.
2. Different Vision: The few individuals I met as potential co-founders had visions that didn't align with mine. I wasn't comfortable with this, I wanted this to be my story. To be honest, I am thankful that I found that very early to avoid conflicts.
3. Lack of Time: My ideal co-founder would be someone capable of working independently. I simply don't have the time to invest in managing a co-founding relationship.

Fun fact: One of them called me the other day saying he wanted to do the idea independently. Was I surprised? No, lmao. I told him I am going to make the code open source soon to get some help anyway, also I’m not the first who is trying to solve this problem, the market is already cluttered and open source folks is dominating it. I just don’t have the time or the experience to do it open source.

Reflecting on this, I admit my approach in searching for a co-founder was flawed. My mind was all centered around finding someone that is symmetrical, a mirror of me believing this would eliminate the need for lengthy explanations and ensure total reliability. However, all the interviews turned out to be more asymmetrical than I anticipated.

Customer Interviews

Despite the setbacks, the mistakes, the time invested, and the constant refinement, the process of building this product has been enlightening; _I know now what my next secret startup will be_.

> Building a failed startup is like an addiction; once you start, you can only go forward. **By me, I just thought of it**

Engaging with potential future customers is crucial in building a startup, so that's exactly what I did, and I made sure to do it early in the process. To start, I read the most recommended book at Reddit -I guess-, '_The Mom Test: How to talk to customers & learn if your business is a good idea when everyone is lying to you_' It set my mind on how to really speak with the target audience to get meaningful feedback and not just engage in pointless talk.

_I loved this part the most, maybe just as coding (I never saw this coming). I did tens of interviews, face to face, video calls, meet a lot of people whom I am very thankful to, learned a lot of stuff about them and their experiences._

I was clueless that Google had been syncing my local-device contacts to the cloud until my free 15GB tier maxed out and I had to delete some stuff ([I am a developer I don’t pay for stuff](https://news.ycombinator.com/item?id=33687639)). I went over every contact, squeezing my brain to find an opener for each of them. Managed to get about 12 folks to talk, ones I haven’t seen in years. Most of them referred me to other people, and those people referred me to more.

I spent about 3-4 months interviewing and researching my target audience. It went through number of iterations before I could finally pinpoint who they ~~really~~ were. This process began just two weeks into coding, a good start that, I guess, is what kept me going.

At first, my target audience were entrepreneurs. The last few interviews, which were late compared to others, made me go over all the interviews again during my haunted intense weekend. It was interesting because I learned at then that calling my target audience 'entrepreneurs' is a sign of ignorance.

In spite, I kept calling them that way. Later on, it backfired and drilled the product down to hell; I was aiming horizontally, I didn’t know that, I didn’t know this term is just another jargon 'Horizontal and Vertical'. That inflated the product features.

The part I missed is “What kind of entrepreneurs? Those who works alone? Part of a company? …”

A wise person kept telling me that I should know if I am building for a horizontal target or vertical one but I was too newbie to understand.

---

I have to mention these two books also; A huge player in structuring the interview questions and the point of discussions. (They are almost alike)

- Testing with Humans: How to use experiments to drive faster, more informed decision making.
- Talking to Humans: Success starts with understanding your customers.

I can’t share interviews details because I didn’t ask for consent at then. Who thought I’d be writing how I failed, but I can share an important finding:

> I don’t care how much -the money-, I care how fast -the delivery-

Problem 2: Deviation From The Mission

In my mind, I presumed the target audience had some technical skill (understanding of what a database, server, etc., are). However, the closer I got to having an MVP, the more I strayed from this assumption.

Two reasons, there were:

1. The extensions have grown to offer a granular control over virtually every aspect of the generation process which led me to create diverse set of extensions; from controlling the server environment to products’ specific extensions which made the app filled with dev specific jargon.
2. The interviews were clearly telling me that entrepreneurs don’t want to build a product (from tech standpoint) rather they want to do the fancy, show off stuff, like marketing, designs and sales.

My user profile shifted from a typical entrepreneur to an entrepreneur who is also a developer. And those Devpreneurs would prefer build stuff from scratch.

I'm over it now. I can't figure out who is my user. But you know what? I don’t care anymore; I AM MY OWN USER. It just hit me, this flashback to the book “_The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses._” There's a story in there about someone who developed an app while closely collaborating with one of their presumed target users. That's something I can do. I can secure a user and build their app using my product, and perhaps it can help me understand who my user is!

VCss

Do you remember _Jian-Yang_ from [Silicon Valley](https://siliconvalleyism.com/silicon-valley-quote.php?id=52) show?

> Jian-Yang: What if I told you there is an app on the market…

---

I didn’t reach any VC because a wise, dear friend told me a secret piece of advice: VC will steal your product in the name of seed investment.

Was that wise? I don’t know, and I might never know.

Although I didn’t take any deliberate steps to get money, a few folks who believed in my skills and trusted me offered to open their wallets and help. However, I didn't accept any money. Back then, my vision was unclear, and I harshly doubted myself.

---

That particular morning, someone whose insights I value advised me to at least make an effort to reach out and learn how to present what I’ve developed effectively. He pointed out that the least I could gain was getting to know the people behind the names in the industry, which in itself is beneficial.

Reflecting on it now, I believe I should have reached out and presented my buggy product or, at the very least, prepared a well-thought-out document. But instead, I chose to spend that time writing code.

Noise
On many occasions, a friend here, a friend there, or a passing folk would tell me to do better UX, not to have this feature, move that button up and to improve the **colors**.

I don’t necessarily disagree with them, but that was more of a luxury I couldn’t afford, both money and time-wise. I mean, It is already month 4; I still don’t have an MVP.

It all started because I was demoing a half-baked, semi-functional solution. A fault that is, however, a good one. I learned that users might initially care more about UX than an actual functional product. Despite this, it left me feeling disappointed and somewhat discouraged.

Yes, you're supposed to keep emotions in check, but hey, we're human after all – there's only so much we can handle. It's crucial to discern who is worthy of seeing what you're working on, as it can mess with you. The whole thing is hard enough already, and adding negative opinions into the mix makes it harder. Not everyone is a friend, nor are they entitled to weigh in on your work.

What Is MVP
OH MY GOD! What on god’s Earth is an MVP?

Just go and look at the internet; everyone has their own definition, and even the mainstream folk can’t agree on a definition. It's a concept muddled in confusion and debate, and it feels like we're all just trying to find our way through this jargon maze!

I’ll tell you what MVP is:

1. Something that can convince investors to give you money and generally invest in your vision.
2. Something that will make the target users be able to give feedback.

MVP in two weeks, they say. 'Don't listen,' I respond.

The major factor in how quickly you can ship an MVP is how skilled you’re in using the available tooling. Go and see Reddit; some folks can have MVP in 2 or 3 days, while others, like me, spend months.

Are you building task management software? you can have MVP in a matter of weeks. You can use GitHub or Atlassian APIs. But years ago, that would have taken you more time.

Landing Page
I tried many times to build a landing page, and all failed. It was late in the process because I was unclear about what I was promoting. Everything felt uncertain.

At first, I tried doing it myself; I scratched the basic layout on paper, wrote the content, imagined the hierarchy and then started coding. Man, it was awful. At that time, I was reading _Employee to Entrepreneur: How to Earn Your Freedom and Do Work that Matters._, specifically the chapter about delegation and I thought I’d give it a shot.

I hired freelances, wasted good time interviewing, and negotiating money, they were asking for around 40$ per hour which is a lot in my country and whats around. Building an absolute garbage landing page costed me about 3500$ + the UI designer expenses. So I let go and decided to rely on my friends to spread the word and collect emails.

Before I paused the work, I was so consumed and my mind was too shattered but I was able to get this low key landing page with small form to collect emails. I still don’t believe that I got about 30 emails from it.

Instead of trying to build a landing page I should’ve bought one. For some reasons I didn’t think about doing so, maybe because I wanted to build something cool like Vercel fancy website. The next time I’ll absolutely invest in this stuff.

The First Client
Once upon a time, I built an app for a friend. Then, on a particularly desperate night, she chose to drop the project entirely and go for a job opportunity overseas instead.

On a similar desperate night, I was exhausted and bloated from Shawarma, I couldn’t move, it was a shitty Shawarma. I started pondering, I thought, "Enough with just coding, it's time to build something tangible, a real-world app." Scrolling WhatsApp looking for someone to connect with. I found that friend’s chat thread and decided to ask if she is interested to give the project another shot.

“Hey, how’s life outside? do you have time for call around 10 am tomorrow?”

I offered to do the project and only pay me after I do an MVP for her, she agreed, and I started to map out what I remember and extracting stuff from the chat history. I mapped out a good prototype and it was time to start using my product.

Wait, I’ve never deployed the code before, I did everything on my little Mac mini, I was merely using GitHub to store the code, I don’t even write commit message; I keep it blank. Shit!

I started battling GitHub Actions, creating indexes for FireStore, ensure logs files are accessible and so on. But It didn’t work:

1. Functions cold startup.
2. No adequate memory for code generation.
3. No undo/redo functionality.
4. No deployment target for the generated code.
5. No control over environment variables.

And many more

Since that debacle, a week's gone by, and I've finally wrestled this beast into submission. I figured out how to bypass most of the issues by letting the browser handle all the non-sensitive grunt work, just to get the code generation engine off the ground.

_I like Firebase Cloud Function but it was the wrong instrument for the play._

Problem 3: The Many Solutions

Midway through the second week, I found myself still wrestling to make different parts of the app work cohesively. Things were functioning, but not together. I found myself having to offer another apology, albeit a somewhat insincere one, for the second time.

“Hey, I’m sorry didn’t get the project to heat up; It’s been quite the month!”

As the first month drew to a close, everything finally fell into place – database integration, deployment and authentication, I set up the tables, crafted workflows, and there it was. I felt an incredible sense of happiness. In just a few hours, I accomplished what had previously taken me months. Everything was up and running smoothly: the code was clean and bug-free, pagination was working seamlessly, and auto-commit and deploy were functioning perfectly. -I’m talking about the user code (generated code)-

It was only when I was asked to implement a delete function that I realized my product didn't allow for much flexibility in adding custom code. I managed to add the feature, but the method felt awkward and hacky. Delete functionality is a common requirement so I tried to standardize my makeshift solution. This aspect of user requirements is often intricately tied to business logic and the specifics of the underlying storage. It's not just about deleting a record – clients often want something more nuanced.

To better understand how to standardize this feature, I created a Google Form and sent it to a few friends to collect their inputs:

- adding a "deleted" flag column
- a "deletedAt" column
- a status column
- creating an archive table with transactions
- maintaining an audit log, among others.

I didn’t prepare the code to have that level of customization. Sure, it's possible, but it requires additional coding from the user side. The delete functionality turned out to be one of many features with case-by-case logic, not easily simplified into a one-size-fits-all solution.

See! Working with users was good. I should’ve done this from the beginning. Facing this challenge early on would have revealed that my initial approach wasn't entrepreneur-friendly. If I had this insight earlier, I might have done better. This is just one example of many.

The Second Client, How
The application was essentially divided into two parts: the Workflow and the Content Designer, corresponding to the backend and UI, respectively, of the generated code. All the effort I had put in up to that point was primarily focused on the backend, as the Content Designer was a massive undertaking.

Contrary to my first client’s requirement, this new client wanted an admin panel developed alongside the backend functionalities. I couldn't afford to build something alongside my main product simultaneously. So, I decided to shift my focus to the Content Designer (stupid move this was), even though the Workflow Designer still needed a ton of work. The Content Designer was an intricate piece, and while I managed to get it to perform some basic functions, it was far from complete.

I found myself in a situation where I had to refuse the project. I suggested focusing on the backend and server logic, but the client was not interested in paying for multiple developers. Money wasn't my primary concern – I even considered offering to work for free. However, I was concerned that doing so might undermine the perceived value of my work.

I was so exhausted from working on the Content Designer and already burned out from the immense amount of bugs. Also, I was still actively researching my users and looking for hires. It wasn’t long till I hated the product and I really wanted a weekend to enjoy it; I mean, staring at an empty wall would be nice!

Again, The First Client
Events & Networking

Networking, Networking, Networking, Networking. Is all I can hear from everyone around. Easier said than done.

You can’t just pop out of your corner and hope to have a network of people; that is me; I have a good network, but a useless one.

So I had to “network” more. Digital network is a complete shit show; it only works if you have already accomplished. You want to “network”? Go and meet people in person.

So I did.

2 gatherings out of 24 had a direct results, one was around the founders to be and another was casual meeting where I had the chance to receive more than just a LinkedIn connection, I got phone numbers for leads.

It wasn’t just that, their needs not only validated my product and vision 100%, but I can also see them praising the work I did, as it might make their’s possible.

Regarding the other gatherings, some felt more like platforms for individuals to promote their own brands, while others seemed to use us as test subjects to improve their public speaking skills.

How I Should Have Done It?

I’d start small, I mean really small. You know, how do you eat an elephant? One bite at a time. _And just for the record, I would never actually eat an elephant._

Identify the core, the very essence of your product, and then build upon it, for me, rather than trying to fulfill an app’s all development aspects I should’ve focused only on one thing, steering clear from building query builder, data modeler, UI/Content designer, key-vault manger and many more. My focus should’ve been solely on the workflow.

Also, I'd seriously consider going full open source right from the start, both to get help and to brag about it a bit more. I used to ask myself, 'Will they steal it?' But, honestly, there's way better and more functional open source software out there than mine. I think the problem is with me using the word 'steal' when I should be thinking 'fork'.

I won’t work alone, not that I won’t start with co-founder, rather I’d hire **Product Manger** from the start, not a market research-er nor a designer rather a Product Manager. If someone asks me what Is the first thing I should do to for my idea/app I’d say hire a **Product Manager**. Perhaps the reasoning behind my argument is that I was doing that role more than anything else and I see how important that is to build something that the user needs. Building a product isn’t linear, not step by step.

Regrets

First off, let me share what I don't regret. Before kicking things off, I hired an agency to do the user research and validate the market, but they dropped the ball and never heard from them after the second email. In retrospect, I'm glad. It turned out to be the most enjoyable part of the process.

- Not working with a product manager early in the process.
- Not collaborating with users right from the start.
- The time I spent on developing a landing page.
- Not being more open and public about my product.
- Falling into the trap of being overly perfectionistic.

I don’t regret eating that shitty Shawaram, though.

I believed (to a degree, still do) that if it worked, It could have a good future. The product uniqueness is producing human-readable code. It is a true code `you can take at any moment and continue its development elsewhere.

It is a brilliant piece of logic, and I’m proud of myself.

It led from overcoming a technically complex product to exploring what I like doing. I don’t and won’t say that my time has been for nothing; on the contrary, my next big idea will fail for a different reason.

I shared this with you, hoping it might help someone. I can keep talking, but I made all the important time points. I’m completing work on the project. If you’d like to be updated, you can join the email list.

#essay/case
