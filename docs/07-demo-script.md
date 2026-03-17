# Demo Script - 2 Minute Hackathon Pitch

## Timing Breakdown

```
[0:00-0:30] Problem Statement
[0:30-1:00] Solution Overview
[1:00-1:45] Live Demo
[1:45-2:00] Why IOTA & Call to Action
```

---

## [0:00-0:30] PROBLEM

**Script:**

> "Every year, the EU produces €2 billion worth of textile waste.
> 
> Consumers have no reason to recycle their old clothes.
> 
> Producers can lie about what materials they use — greenwashing with no consequences.
> 
> And there's zero accountability from the factory to the landfill.
> 
> **We're here to fix that.**"

**Visual:** Show slide with waste statistics, or open with dramatic image of textile landfill.

---

## [0:30-1:00] SOLUTION

**Script:**

> "Here's how it works:
> 
> A producer makes a t-shirt and **locks €2 into a Digital Product Passport** — a smart contract on IOTA.
> 
> They claim it's 100% cotton and create a QR code.
> 
> The consumer buys the shirt, scans the code, and sees: 'Bring this back for recycling, get €2.'
> 
> When they're done with it, they mark it for end-of-life and bring it to a recycler.
> 
> The recycler inspects the material. If it **actually is** cotton, the €2 goes to the consumer.
> 
> If the producer lied? Greenwashing gets flagged on-chain. Permanent record."

**Visual:** Show simple flow diagram (can be animated slide or whiteboard sketch).

```
Producer → Lock €2 → Consumer → Recycle → Verify → Unlock €2
```

---

## [1:00-1:45] LIVE DEMO

### Setup (Pre-Demo)
- Have browser open with three tabs pre-loaded
- Or single page with tabs (current implementation)
- Start on Producer view

### Demo Flow

**[Producer View - 15 seconds]**

> "Let's say I'm EcoThreads, a producer in Belgium.
> 
> I select my material: *[click dropdown]* 100% Organic Cotton.
> 
> I lock €2 as the recycling reward. *[click slider]*
> 
> And I click 'Lock Value & Create DPP.' *[click button]*
> 
> Here's my QR code. This goes on the t-shirt tag."

**Visual:** Show the generated QR code prominently.

---

**[Consumer View - 30 seconds]**

> "Now I'm the consumer. I bought this shirt, and I scan the QR code. *[click Consumer tab]*
> 
> I see: 100% Organic Cotton, made by EcoThreads, and **€2 waiting for me** when I recycle it.
> 
> Two years later, I'm done with this shirt. I enter my wallet address *[type or paste]* and mark it 'End of Life.' *[click button]*
> 
> Now it says 'Awaiting Recycler.' I bring it to a recycling center."

**Visual:** Highlight the wallet input and the status change to "Awaiting Recycler."

---

**[Recycler View - 30 seconds]**

> "I'm the recycler now. The consumer brings me the shirt. *[click Recycler tab]*
> 
> I scan the code and see the producer claimed: 100% Organic Cotton.
> 
> I inspect the fabric. *[pause for effect]* It **is** cotton. All good.
> 
> I click 'Confirm Material & Unlock €2.' *[click button]*
> 
> And just like that, the smart contract releases the funds. *[switch to Consumer tab]*
> 
> The consumer sees: 'Value Claimed! €2.00 sent to your wallet.'"

**Visual:** Show the success screen (🎉) on Consumer tab.

---

## [1:45-2:00] WHY IOTA

**Script:**

> "Why IOTA?
> 
> **Feeless transactions.** We can lock €2 into every single t-shirt without gas fees eating the reward. On Ethereum, this would be impossible.
> 
> IOTA's **Move smart contracts** handle the escrow. The value is locked in the product itself.
> 
> And it creates **immutable proof** of recycling — and greenwashing — on-chain.
> 
> This isn't just a demo. This is **circular economy infrastructure**, ready for the EU's Digital Product Passport regulations.
> 
> Thank you."

**Visual:** End screen with:
- Project name: "T-Shirt Recycling Escrow"
- Team: "Tabulas"
- Tagline: "Circular Economy Infrastructure"
- QR code to try the demo

---

## Pro Tips for Delivery

### Before You Start
1. **Test the demo 10+ times** — muscle memory is crucial
2. Have backup slides if live demo fails
3. Know your package ID and transaction hashes
4. Pre-type wallet address (don't fumble typing)

### During Presentation
1. **Speak slowly** — you have 2 minutes, use it
2. **Show, don't tell** — Let the UI speak for itself
3. **Pause after key points** — "Greenwashing gets flagged." [pause]
4. **Make eye contact** — Don't stare at your screen

### If Demo Fails
1. Have screenshots ready as backup
2. Say: "Let me show you what _would_ happen..."
3. Don't panic — explain the concept verbally
4. Show the code/contract as fallback

---

## Q&A Preparation

### Expected Questions

**Q: How do you verify the recycler is legitimate?**
> A: MVP trusts any recycler. Phase 2 adds a recycler registry with KYC/authorization.

**Q: What if the consumer never recycles?**
> A: Future: timeout mechanism (e.g., 5 years → value returns to producer). For now, value stays locked.

**Q: Who pays the €2?**
> A: Producer. It's their EPR (Extended Producer Responsibility) compliance cost, built into the product price.

**Q: Can this work for other products?**
> A: Absolutely. Electronics, batteries, packaging — anything with EPR requirements.

**Q: What if someone games the system?**
> A: Future: ZKP for consumer verification, NIR scanners for objective material testing, staking for recyclers.

**Q: Why not just use a database?**
> A: Blockchain provides immutability. Producers can't delete greenwashing flags. Regulators can audit the entire history.

---

## Backup Materials

### If Extra Time Available
- Show IOTA Explorer transaction
- Show smart contract code
- Explain Move language benefits
- Show DPP data structure

### One-Liner Pitches
- "Kickstarter for recycling — but the money comes from the producer."
- "Escrow meets circular economy."
- "Green claims with skin in the game."

---

## Post-Demo Follow-Up

After the pitch:
1. Share demo link (vercel deployment)
2. Share GitHub repo
3. Share slide deck
4. Collect emails of interested parties
5. Follow up with judges/investors

---

*For future development plans, see `08-roadmap-and-future.md`*
