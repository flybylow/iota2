# Documentation Index

Welcome to the **IOTA2 Circular Economy Platform** documentation. This folder contains comprehensive documentation for THREE interconnected projects built by Tabulas for the MasterZ × IOTA Hackathon.

## 🚀 Active Projects

1. **ScholarFlow** - Grant management system (✅ LIVE on testnet)
2. **T-Shirt DPP** - Smart contracts for circular economy (✅ Ready for deployment)
3. **T-Shirt Escrow** - Prototype UI for DPP system (✅ Running locally)

---

## 📚 Documentation Structure

### 🎯 Start Here

**[BUILD_COMPLETE.md](BUILD_COMPLETE.md)** ⭐  
Complete overview of all three projects, current status, metrics, and next steps.

### 📖 Project-Specific Documentation

#### ScholarFlow (LIVE) ⭐

**[10-scholarflow-overview.md](10-scholarflow-overview.md)** - Complete guide
- Smart contract architecture (grant.move)
- Frontend implementation (Next.js + IOTA dApp Kit)
- Deployment to testnet (Package ID included)
- User flows and testing
- Live blockchain integration

**Status**: ✅ Deployed to IOTA testnet, fully operational

#### T-Shirt DPP (Smart Contracts) ⭐

**[11-tshirt-dpp-contracts.md](11-tshirt-dpp-contracts.md)** - Complete guide
- Full contract documentation (tshirt_dpp.move)
- ManufacturerCap and RecyclerCap system
- Lifecycle tracking (Active → EOL → Recycled)
- Deployment guide
- Integration instructions

**Status**: ✅ Complete, ready for testnet deployment

#### Project Integration ⭐

**[12-project-integration-guide.md](12-project-integration-guide.md)** - Integration guide
- How all three projects relate
- Side-by-side comparison
- Step-by-step integration plan
- Code examples for connecting UI to contracts
- Deployment checklist
- Security considerations

**Status**: ✅ Complete integration roadmap

#### T-Shirt Escrow (Prototype UI)

**[02-tshirt-escrow-overview.md](02-tshirt-escrow-overview.md)**  
High-level overview of the problem, solution, stakeholders, and why IOTA is the perfect fit.

- The €2B textile waste problem
- How the escrow system works
- Three-actor system (Producer/Consumer/Recycler)
- Why IOTA enables this solution

### User Experience

**[03-user-flows.md](03-user-flows.md)**  
Detailed interaction flows for each user type with visual elements and edge cases.

- 🏭 Producer flow (create DPP, lock value)
- 👤 Consumer flow (view, mark EOL, claim reward)
- ♻️ Recycler flow (verify, unlock, or flag)
- Status progression and edge cases

### Technical Implementation

**[04-technical-architecture.md](04-technical-architecture.md)**  
Data structures, smart contract code (Move), and IOTA integration details.

- DPP data model (TypeScript interface)
- Move smart contract (complete source)
- QR code integration
- IOTA resources and testnet info

**[05-react-component.md](05-react-component.md)**  
React component implementation guide, state management, and IOTA SDK integration.

- Component structure and hierarchy
- State variables explained
- Mock vs. IOTA-integrated versions
- Styling architecture

**[09-react-component-source.md](09-react-component-source.md)**  
Complete React component source code (copy-paste ready).

- Full TShirtEscrow component
- Usage instructions
- Customization tips

### Deployment

**[06-deployment-guide.md](06-deployment-guide.md)**  
Step-by-step deployment instructions for local development, testnet, and production.

- Local setup
- IOTA CLI installation
- Smart contract deployment
- Vercel deployment
- Production checklist

### Presentation

**[07-demo-script.md](07-demo-script.md)**  
Complete 2-minute pitch script for the Berlin finals with timing and Q&A prep.

- Problem (0:00-0:30)
- Solution (0:30-1:00)
- Live demo (1:00-1:45)
- Why IOTA (1:45-2:00)
- Q&A preparation

### Future Vision

**[08-roadmap-and-future.md](08-roadmap-and-future.md)**  
Development phases, feature roadmap, open questions, and long-term vision.

- Phase 2: IOTA integration (ScholarFlow ✅ done!)
- Phase 3: Berlin finals polish
- Phase 4+: Production features
- 5-year vision

### Foundation

**[01-organization-guidelines.md](01-organization-guidelines.md)**  
Project organization standards, naming conventions, and documentation best practices.

---

## 🚀 Quick Start Paths

### I want to run the DPP system (DPP_core + DPP_UI)
1. **[DPP_STARTUP.md](DPP_STARTUP.md)** – Full startup: IOTA CLI, testnet, deploy DPP_core, create registry, run DPP_UI.
2. If already deployed: [DPP_core/DEPLOYED.md](../DPP_core/DEPLOYED.md) for IDs → `DPP_UI/.env.local` → `npm run dev` in DPP_UI.

### I want to understand ALL projects
1. Start with [BUILD_COMPLETE.md](BUILD_COMPLETE.md)
2. Read [10-scholarflow-overview.md](10-scholarflow-overview.md) (live system)
3. Read [11-tshirt-dpp-contracts.md](11-tshirt-dpp-contracts.md) (contracts)
4. Read [02-tshirt-escrow-overview.md](02-tshirt-escrow-overview.md) (UI)

### I want to work on ScholarFlow
1. Read [10-scholarflow-overview.md](10-scholarflow-overview.md)
2. Check `scholarflow_core/` for smart contracts
3. Check `scholarflow-ui/` for frontend
4. Test on testnet (Package ID in docs)

### I want to deploy T-Shirt DPP
1. Read [11-tshirt-dpp-contracts.md](11-tshirt-dpp-contracts.md)
2. Navigate to `tshirt_dpp/`
3. Run `iota move test`
4. Follow deployment guide in docs
5. Update `tshirt-escrow/` UI with package ID

### I want to build/deploy T-Shirt Escrow
1. Read [04-technical-architecture.md](04-technical-architecture.md)
2. Copy code from [09-react-component-source.md](09-react-component-source.md)
3. Follow [06-deployment-guide.md](06-deployment-guide.md)
4. Connect to deployed tshirt_dpp contracts

### I want to present this
1. Read [BUILD_COMPLETE.md](BUILD_COMPLETE.md) for overview
2. Demo ScholarFlow (live on testnet!)
3. Demo T-Shirt Escrow UI
4. Follow [07-demo-script.md](07-demo-script.md)
5. Prepare Q&A with [08-roadmap-and-future.md](08-roadmap-and-future.md)

### I want to contribute
1. Read [01-organization-guidelines.md](01-organization-guidelines.md)
2. Check [BUILD_COMPLETE.md](BUILD_COMPLETE.md) "What's Next" section
3. Pick a project and feature to work on

---

## 📊 Document Quick Reference

| Document | Purpose | Audience | Status |
|----------|---------|----------|--------|
| **DPP_STARTUP** | How to start DPP (CLI → testnet → DPP_core → DPP_UI) | Developers | ⭐ Start here for DPP |
| BUILD_COMPLETE | Master overview | Everyone | ⭐ Updated |
| 12-project-integration-guide | Integration & comparison | Developers | ⭐ NEW |
| 10-scholarflow-overview | ScholarFlow guide | Developers | ⭐ NEW |
| 11-tshirt-dpp-contracts | DPP contracts guide | Developers | ⭐ NEW |
| 01-organization | Project structure rules | All contributors | ✓ |
| 02-overview | T-Shirt Escrow overview | Everyone | ✓ |
| 03-user-flows | UX details | Designers, testers | ✓ |
| 04-architecture | Technical design | Developers | ✓ |
| 05-react-component | Frontend implementation | Frontend devs | ✓ |
| 06-deployment | How to deploy | DevOps, developers | ✓ |
| 07-demo-script | Pitch presentation | Ward, presenters | ✓ |
| 08-roadmap | Future plans | Team, investors | ✓ |
| 09-component-source | Copy-paste code | Developers | ✓ |

---

## 🔗 External Resources

### IOTA Documentation
- **Main docs**: https://docs.iota.org/
- **Move language**: https://docs.iota.org/developer/iota-move-ctf/
- **Testnet faucet**: https://faucet.testnet.iota.org/
- **Explorer**: https://explorer.testnet.iota.org/

### Project Links
- **GitHub**: *(Add repository URL)*
- **Demo**: *(Add Vercel deployment URL)*
- **Contact**: ward@tabulas.eu

### Hackathon Info
- **Event**: MasterZ × IOTA
- **Finals**: April 1st, Berlin
- **Goal**: Top 5 → Berlin trip + pitch to IOTA Foundation

---

## 📝 Document Conventions

### File Naming
- Numbered prefixes for sequential reading (`01-`, `02-`, etc.)
- Descriptive, kebab-case names
- `.md` extension for markdown

### Internal Links
- Use relative paths: `[link text](./filename.md)`
- Link to specific sections: `[link text](./filename.md#section-name)`

### Code Blocks
- Always specify language: ` ```typescript`, ` ```bash`, etc.
- Include comments for clarity
- Use real examples, not placeholders

---

## 🤝 Contributing to Docs

When adding new documentation:

1. **Follow naming convention**: `##-descriptive-name.md`
2. **Update this README**: Add entry to the structure above
3. **Cross-reference**: Link to related docs at bottom of page
4. **Keep it current**: Update timestamp at bottom of file
5. **Be specific**: Use examples, not abstract descriptions

---

## 🎯 Project Status

### ScholarFlow
**Status**: ✅ **LIVE ON TESTNET**  
**Package**: `0x1349d25e9193ce1ccb0f3f58d8082a3986d376e72f6355be5ad22b684055d926`  
**Frontend**: Running on localhost:3000

### T-Shirt DPP
**Status**: ✅ **READY FOR DEPLOYMENT**  
**Contract**: Complete (183 lines Move)  
**Next**: Deploy to testnet

### T-Shirt Escrow
**Status**: ✅ **PROTOTYPE RUNNING**  
**UI**: Fully functional  
**Next**: Connect to deployed tshirt_dpp contracts

**Target Date**: Berlin Finals - April 1st, 2026

See [BUILD_COMPLETE.md](BUILD_COMPLETE.md) for detailed status and metrics.

---

## 📞 Contact

**Ward** - UX/Product Lead  
Discord: ward_tabulas  
Email: ward@tabulas.eu

**Team:** Tabulas  
**Mission:** Circular Economy Infrastructure

---

---

## 📈 Quick Stats

- **Documentation**: 14 files, 90,000+ words
- **Smart Contracts**: 2 Move modules, 247 lines
- **Frontends**: 2 Next.js apps, 1,200+ lines TypeScript
- **Blockchain**: 1 package deployed to testnet
- **Features**: Grant management + Circular economy DPP system

---

*Last updated: January 29, 2026*
