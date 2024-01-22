import { CohereClient } from "cohere-ai";
import { cohereToken } from "../config";

const cohere = new CohereClient({
    token: cohereToken,
});

// Generate embeddings for a given text
// Enables us to compare the similarity between two texts
// isSearching is true if the text is a search query
export async function generateEmbedding(
    text: string,
    isSearching: boolean = false
) {
    const response = await cohere.embed({
        texts: [text],
        model: "embed-multilingual-v3.0",
        inputType: isSearching ? "search_query" : "search_document",
    });
    return response.embeddings[0];
}

export async function classifyCategory(
    text: string
): Promise<{ category: number; confidence: number } | null> {
    const response = await cohere.classify({
        inputs: [text],
        examples: [
            {
                label: "5", // General
                text:
                    "Pomoć oko selidbe - Pakiranje i premještaj\n\n" +
                    "Trebam pomoć u pakiranju stvari za selidbu! Imate li iskustva s organizacijom " +
                    "i brzim pakiranjem? Ponudite svoju pomoć i zaradite " +
                    "nešto dodatnog novca. Fleksibilno radno vrijeme!",
            },
            {
                label: "5",
                text:
                    "Moving Assistance - Packing and Moving\n\n" +
                    " I need help packing for a move! Do you have experience with " +
                    "organizing and efficient packing? Offer your assistance and " +
                    "earn some extra cash. Flexible working hours!",
            },
            {
                label: "6", // Home services
                text: "Trebam majstora za popravak perilice rublja.",
            },
            {
                label: "6",
                text:
                    "Čišćenje doma - Tražim pouzdanu pomoćnicu!\n\n" +
                    "Trebam pomoć u redovnom čišćenju stana. Tražim odgovornu i " +
                    "pouzdanu osobu koja voli održavati prostor čistim. " +
                    "Ponudite svoje usluge i zaradite nagradu!",
            },
            {
                label: "6",
                text:
                    "Home Cleaning - Looking for a reliable helper!\n\n" +
                    "I need help with regular home cleaning. I am looking for a " +
                    "responsible and reliable person who enjoys keeping spaces clean. " +
                    "Offer your services and earn a reward!",
            },
            {
                label: "7", // Technology Assistance
                text: "Trebam pomoć oko instalacije Windowsa na novi laptop.",
            },
            {
                label: "7",
                text: "I need help installing Windows on my new laptop.",
            },
            {
                label: "7",
                text:
                    "Pomoć s računalom - Instalacija softvera\n\n" +
                    "Trebam pomoć oko instalacije određenog softvera na mom računalu. " +
                    "Ako imate iskustva s instalacijama i " +
                    "podešavanjima, javite se! Plaćam za vašu stručnost.",
            },
            {
                label: "7",
                text:
                    "Computer Assistance - Software Installation\n\n" +
                    "I need help installing specific software on my computer. " +
                    "If you have experience with installations and " +
                    "configurations, let me know! I pay for your expertise.",
            },
            {
                label: "8", // Errands and delivery
                text: "Trebam dostavu namirnica iz dućana. Plaćam 10 kn po dostavi.",
            },
            {
                label: "8",
                text: "I need groceries delivered from the store. I pay 10 kn per delivery.",
            },
            {
                label: "8",
                text:
                    "Dostava namirnica - Zaradi dok pomažeš!\n\n" +
                    "Voliš vožnju i imaš vlastiti automobil? " +
                    "Pridruži se našem timu dostavljača! " +
                    "Dostavljaj namirnice i zaradi dok pomažeš zajednici.",
            },
            {
                label: "8",
                text:
                    "Grocery Delivery - Earn while helping!\n\n" +
                    "Do you enjoy driving and have your own car? " +
                    "Join our team of delivery drivers! " +
                    "Deliver groceries and earn while helping the community.",
            },
            {
                label: "9", // Creative and Design
                text: "Trebam dizajn za logo tvrtke.",
            },
            {
                label: "9",
                text: "I need a design for my company logo.",
            },
            {
                label: "9",
                text:
                    "Izrada personaliziranih čestitki - Unikatni pokloni!\n\n" +
                    "Imate li kreativne vještine? Napravite personaliziranu " +
                    "čestitku za posebnu prigodu. Naručite jedinstven " +
                    "poklon i podržite lokalne umjetnike.",
            },
            {
                label: "9",
                text:
                    "Custom Greeting Cards - Unique Gifts!\n\n" +
                    "Do you have creative skills? Make a personalized " +
                    "greeting card for a special occasion. Order a unique " +
                    "gift and support local artists.",
            },
            {
                label: "10", // Fitness and Health
                text: "Trebam osobnog trenera za vježbanje.",
            },
            {
                label: "10",
                text: "I need a personal trainer for exercising.",
            },
            {
                label: "10",
                text:
                    "Osobni trener - Pomoć u vježbanju\n\n" +
                    "Trebam pomoć u vježbanju i motivaciji. " +
                    "Ako imate iskustva s osobnim treninzima, " +
                    "javite se i zaradite dok pomažete!",
            },
            {
                label: "10",
                text:
                    "Personal Trainer - Exercise Assistance\n\n" +
                    "I need help with exercising and motivation. " +
                    "If you have experience with personal training, " +
                    "let me know and earn while helping!",
            },
            {
                label: "11", // Business
                text: "Trebam pomoć oko izrade poslovnog plana.",
            },
            {
                label: "11",
                text: "I need help with making a business plan.",
            },
            {
                label: "11",
                text:
                    "Financijsko savjetovanje za male poduzetnike - Ojačajte svoj biznis!\n\n" +
                    "Male poduzetnike potičemo da se jave za besplatno financijsko savjetovanje. " +
                    "Ojačajte svoj biznis uz stručne savjete. Vaš uspjeh je naša misija!",
            },
            {
                label: "11",
                text:
                    "Financial Consulting for Small Business Owners - Strengthen Your Business!\n\n" +
                    "We encourage small business owners to apply for free financial consulting. " +
                    "Strengthen your business with expert advice. Your success is our mission!",
            },
            {
                label: "12", // Education
                text: "Trebam instruktora za učenje gitare.",
            },
            {
                label: "12",
                text: "I need a tutor for learning guitar.",
            },
            {
                label: "12",
                text:
                    "Privatne instrukcije iz matematike\n\n" +
                    "Trebam instruktora za učenje matematike.",
            },
            {
                label: "12",
                text:
                    "Private Math Tutoring\n\n" +
                    "I need a tutor for learning math.",
            },
        ],
        model: "classify-multilingual-v3.0",
    });

    if (!response.classifications) return null;

    const category = parseInt(response.classifications[0].prediction as string);
    const confidence = response.classifications[0].confidence;

    return { category, confidence: confidence || 0 };
}
