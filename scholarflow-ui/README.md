# 🎓 ScholarFlow UI

Modern, production-ready UI for the ScholarFlow grant management system on IOTA blockchain.

## ✨ Features

- 📝 **Mint Grants**: Create scholarship grants for students
- 📊 **View Grants**: See all minted grants with full details
- 🔐 **Wallet Integration**: Connect with IOTA wallet
- ✅ **Address Validation**: Built-in IOTA address validation
- 🎨 **Modern UI**: Clean, GitHub-inspired dark theme

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- IOTA wallet (for testnet)
- AdminCap from deployed ScholarFlow contract

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Configuration

Update the `PACKAGE_ID` in `app/page.tsx`:

```typescript
const PACKAGE_ID = 'YOUR_DEPLOYED_PACKAGE_ID';
```

## 🎯 How to Use

### 1. Connect Wallet

Click **"Connect Wallet"** button in the top-right corner.

### 2. Mint a Grant

1. Enter student's IOTA address (66 characters starting with `0x`)
2. Or click **"Use My Address"** to use your connected wallet
3. Enter grant amount
4. Click **"Mint Grant"**
5. Sign transaction in wallet

### 3. View Grants

All minted grants appear in the **"Recent Grants"** section below:
- Grant ID
- Student address
- Amount
- Timestamp

## 🛠️ Technical Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **@iota/dapp-kit** - IOTA wallet integration
- **@iota/iota-sdk** - Blockchain interaction

## 📦 Smart Contract Integration

Connects to ScholarFlow core contract:

```move
module scholarflow_core::grant {
    public entry fun mint_grant(
        _: &AdminCap,
        student: address,
        amount: u64,
        ctx: &mut TxContext
    )
}
```

## 🔒 Admin Requirements

**Only users with `AdminCap` can mint grants.**

AdminCap is created during contract deployment and transferred to the admin.

## 🎨 UI Components

### Grant Form
- Student address input with validation
- Amount input (numeric only)
- "Use My Address" quick-fill button
- Real-time validation feedback

### Grants List
- Sortable grant cards
- Full grant details
- Timestamp formatting
- Responsive grid layout

## 🐛 Troubleshooting

### "AdminCap not found"
- Make sure you're connected with the admin wallet
- Verify AdminCap was transferred to your address

### "Invalid address format"
- IOTA addresses must be exactly 66 characters
- Must start with `0x`
- Only hexadecimal characters (0-9, a-f)

### "Transaction failed"
- Check you have sufficient IOTA for gas fees
- Verify contract is deployed to testnet
- Ensure AdminCap permissions

## 📚 Related Documentation

- [ScholarFlow Core Contract](../scholarflow_core/)
- [IOTA Documentation](https://docs.iota.org/)
- [Move Language](https://github.com/move-language/move)

## 🌟 Status

✅ **Production Ready**
- Contract deployed to IOTA testnet
- UI fully functional
- Wallet integration working
- Address validation implemented

---

**Built with ❤️ for the IOTA ecosystem**
