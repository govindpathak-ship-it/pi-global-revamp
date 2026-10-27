// Shared sample conversations: the hero console loops them; the "Hear Pi talk" section plays the voice ones as audio.

export const accent: Record<string, string> = { sales: "#00BAF2", service: "#27AE60", operations: "#002970" };

export type Msg = { from: "agent" | "user"; text: string; lights?: number };
export type Scenario = {
  agent: string;
  agentName: string;
  channel: "WhatsApp" | "Voice AI";
  call?: { direction: "Outbound" | "Inbound"; language: string };
  msgs: Msg[];
};

export const scenarios: Scenario[] = [
  {
    agent: "sales", agentName: "Pi Sales & Marketing Agent", channel: "Voice AI", call: { direction: "Outbound", language: "English" },
    msgs: [
      { from: "agent", lights: 1, text: "Hi! I’m calling about the SUV you enquired about. Is this a good time?" },
      { from: "user", text: "Yes! Can I take a test drive?" },
      { from: "agent", lights: 2, text: "Of course! Does Saturday at 11 AM work for you?" },
      { from: "user", text: "Saturday works." },
      { from: "agent", lights: 3, text: "It’s booked! I’ve sent the details to your WhatsApp." },
    ],
  },
  {
    agent: "operations", agentName: "Pi Operations Agent", channel: "WhatsApp",
    msgs: [
      { from: "agent", lights: 1, text: "Hi! Your EMI is due on the 5th. Shall I set up UPI Autopay so you never miss a payment?" },
      { from: "user", text: "Yes, please set it up." },
      { from: "agent", lights: 2, text: "Done ✅ UPI Autopay is active, and your KYC is now complete." },
      { from: "user", text: "Super, thank you!" },
      { from: "agent", lights: 3, text: "You’re all set. Reminders and receipts will come right here on WhatsApp." },
    ],
  },
  {
    agent: "service", agentName: "Pi Service Agent", channel: "Voice AI", call: { direction: "Inbound", language: "English" },
    msgs: [
      { from: "user", text: "Hi, one item in order #OD1024 came damaged. I want a refund." },
      { from: "agent", lights: 1, text: "Sorry about that! Is it the blue kurta from order #OD1024?" },
      { from: "user", text: "Yes, that one." },
      { from: "agent", lights: 2, text: "All done. Your refund is initiated, and you’ll get an SMS shortly." },
      { from: "user", text: "That was quick, thanks!" },
      { from: "agent", lights: 3, text: "Happy to help. Have a great day!" },
    ],
  },
  {
    agent: "sales", agentName: "Pi Sales & Marketing Agent", channel: "WhatsApp",
    msgs: [
      { from: "agent", lights: 1, text: "Hi! You were looking at a few items earlier — they’re still in your cart. Want me to help you complete the order?" },
      { from: "user", text: "Yes please, share the link." },
      { from: "agent", lights: 2, text: "Here’s your secure payment link 🔗 Pay in one tap with UPI." },
      { from: "user", text: "Paid ✅" },
      { from: "agent", lights: 3, text: "Thank you! Your order is confirmed and on its way 🎉" },
    ],
  },
  {
    agent: "operations", agentName: "Pi Operations Agent", channel: "Voice AI", call: { direction: "Outbound", language: "Hindi" },
    msgs: [
      { from: "agent", lights: 1, text: "Namaste! Aapki EMI 5 tareekh ko due hai. Kya aap tab tak payment kar paayenge?" },
      { from: "user", text: "Haan, main 4 tareekh tak kar dunga." },
      { from: "agent", lights: 2, text: "Theek hai, 4 tareekh note kar li hai. Payment link WhatsApp par bhej diya hai." },
      { from: "user", text: "Thank you." },
      { from: "agent", lights: 3, text: "Dhanyavaad! Aapko ek reminder bhi mil jayega." },
    ],
  },
];

