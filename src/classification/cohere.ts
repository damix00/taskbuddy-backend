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
                label: "general", // General
                text:
                    "Pomoć oko selidbe - Pakiranje i premještaj\n\n" +
                    "Trebam pomoć u pakiranju stvari za selidbu! Imate li iskustva s organizacijom " +
                    "i brzim pakiranjem? Ponudite svoju pomoć i zaradite " +
                    "nešto dodatnog novca. Fleksibilno radno vrijeme!",
            },
            {
                label: "general",
                text:
                    "Moving Assistance - Packing and Moving\n\n" +
                    " I need help packing for a move! Do you have experience with " +
                    "organizing and efficient packing? Offer your assistance and " +
                    "earn some extra cash. Flexible working hours!",
            },
            {
                label: "home_services", // Home services
                text: "Trebam majstora za popravak perilice rublja.",
            },
            {
                label: "home_services",
                text:
                    "Čišćenje doma - Tražim pouzdanu pomoćnicu!\n\n" +
                    "Trebam pomoć u redovnom čišćenju stana. Tražim odgovornu i " +
                    "pouzdanu osobu koja voli održavati prostor čistim. " +
                    "Ponudite svoje usluge i zaradite nagradu!",
            },
            {
                label: "home_services",
                text:
                    "Home Cleaning - Looking for a reliable helper!\n\n" +
                    "I need help with regular home cleaning. I am looking for a " +
                    "responsible and reliable person who enjoys keeping spaces clean. " +
                    "Offer your services and earn a reward!",
            },
            {
                label: "technology", // Technology Assistance
                text: "Trebam pomoć oko instalacije Windowsa na novi laptop.",
            },
            {
                label: "technology",
                text: "I need help installing Windows on my new laptop.",
            },
            {
                label: "technology",
                text:
                    "Pomoć s računalom - Instalacija softvera\n\n" +
                    "Trebam pomoć oko instalacije određenog softvera na mom računalu. " +
                    "Ako imate iskustva s instalacijama i " +
                    "podešavanjima, javite se! Plaćam za vašu stručnost.",
            },
            {
                label: "technology",
                text:
                    "Computer Assistance - Software Installation\n\n" +
                    "I need help installing specific software on my computer. " +
                    "If you have experience with installations and " +
                    "configurations, let me know! I pay for your expertise.",
            },
            {
                label: "errands_and_delivery", // Errands and delivery (8)
                text: "Trebam dostavu namirnica iz dućana. Plaćam 10 kn po dostavi.",
            },
            {
                label: "errands_and_delivery",
                text: "I need groceries delivered from the store. I pay 10 kn per delivery.",
            },
            {
                label: "errands_and_delivery",
                text:
                    "Dostava namirnica - Zaradi dok pomažeš!\n\n" +
                    "Voliš vožnju i imaš vlastiti automobil? " +
                    "Pridruži se našem timu dostavljača! " +
                    "Dostavljaj namirnice i zaradi dok pomažeš zajednici.",
            },
            {
                label: "errands_and_delivery",
                text:
                    "Grocery Delivery - Earn while helping!\n\n" +
                    "Do you enjoy driving and have your own car? " +
                    "Join our team of delivery drivers! " +
                    "Deliver groceries and earn while helping the community.",
            },
            {
                label: "creative_and_design", // Creative and Design
                text: "Trebam dizajn za logo tvrtke.",
            },
            {
                label: "creative_and_design",
                text: "I need a design for my company logo.",
            },
            {
                label: "creative_and_design",
                text:
                    "Izrada personaliziranih čestitki - Unikatni pokloni!\n\n" +
                    "Imate li kreativne vještine? Napravite personaliziranu " +
                    "čestitku za posebnu prigodu. Naručite jedinstven " +
                    "poklon i podržite lokalne umjetnike.",
            },
            {
                label: "creative_and_design",
                text:
                    "Custom Greeting Cards - Unique Gifts!\n\n" +
                    "Do you have creative skills? Make a personalized " +
                    "greeting card for a special occasion. Order a unique " +
                    "gift and support local artists.",
            },
            {
                label: "fitness_and_health", // Fitness and Health
                text: "Trebam osobnog trenera za vježbanje.",
            },
            {
                label: "fitness_and_health",
                text: "I need a personal trainer for exercising.",
            },
            {
                label: "fitness_and_health",
                text:
                    "Osobni trener - Pomoć u vježbanju\n\n" +
                    "Trebam pomoć u vježbanju i motivaciji. " +
                    "Ako imate iskustva s osobnim treninzima, " +
                    "javite se i zaradite dok pomažete!",
            },
            {
                label: "fitness_and_health",
                text:
                    "Personal Trainer - Exercise Assistance\n\n" +
                    "I need help with exercising and motivation. " +
                    "If you have experience with personal training, " +
                    "let me know and earn while helping!",
            },
            {
                label: "business", // Business
                text: "Trebam pomoć oko izrade poslovnog plana.",
            },
            {
                label: "business",
                text: "I need help with making a business plan.",
            },
            {
                label: "business",
                text:
                    "Financijsko savjetovanje za male poduzetnike - Ojačajte svoj biznis!\n\n" +
                    "Male poduzetnike potičemo da se jave za besplatno financijsko savjetovanje. " +
                    "Ojačajte svoj biznis uz stručne savjete. Vaš uspjeh je naša misija!",
            },
            {
                label: "business",
                text:
                    "Financial Consulting for Small Business Owners - Strengthen Your Business!\n\n" +
                    "We encourage small business owners to apply for free financial consulting. " +
                    "Strengthen your business with expert advice. Your success is our mission!",
            },
            {
                label: "education", // Education
                text: "Trebam instruktora za učenje gitare.",
            },
            {
                label: "education",
                text: "I need a tutor for learning guitar.",
            },
            {
                label: "education",
                text:
                    "Privatne instrukcije iz matematike\n\n" +
                    "Trebam instruktora za učenje matematike.",
            },
            {
                label: "education",
                text:
                    "Private Math Tutoring\n\n" +
                    "I need a tutor for learning math.",
            },
        ],
        model: "embed-multilingual-v3.0",
    });

    const map = {
        general: 5,
        home_services: 6,
        technology: 7,
        errands_and_delivery: 8,
        creative_and_design: 9,
        fitness_and_health: 10,
        business: 11,
        education: 12,
    };

    if (!response.classifications) return null;

    const category = response.classifications[0].prediction;
    const confidence = response.classifications[0].confidence;

    // @ts-ignore
    return { category: map[category], confidence: confidence || 0 };
}
