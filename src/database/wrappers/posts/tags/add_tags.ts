import { CategoryReads } from "../categories/wrapper";
import { TagWrites } from "./wrapper";

export default async function addTags() {
    const homeServices = (await CategoryReads.getCategoryById(6))!;

    TagWrites.createTag(homeServices.category_id, {
        en: "Cleaning",
        hr: "Čišćenje",
    });

    TagWrites.createTag(homeServices.category_id, {
        en: "Cooking",
        hr: "Kuhanje",
    });

    TagWrites.createTag(homeServices.category_id, {
        en: "Gardening",
        hr: "Vrtlarenje",
    });

    TagWrites.createTag(homeServices.category_id, {
        en: "Moving",
        hr: "Selidba",
    });

    TagWrites.createTag(homeServices.category_id, {
        en: "Plumbing",
        hr: "Vodoinstalacija",
    });

    TagWrites.createTag(homeServices.category_id, {
        en: "Electricity",
        hr: "Elektrika",
    });

    TagWrites.createTag(homeServices.category_id, {
        en: "Painting",
        hr: "Bojanje",
    });

    TagWrites.createTag(homeServices.category_id, {
        en: "Repair",
        hr: "Popravci",
    });

    const techSupport = (await CategoryReads.getCategoryById(7))!;

    TagWrites.createTag(techSupport.category_id, {
        en: "Computer repair",
        hr: "Popravak računala",
    });

    TagWrites.createTag(techSupport.category_id, {
        en: "Device repair",
        hr: "Popravak uređaja",
    });

    TagWrites.createTag(techSupport.category_id, {
        en: "Software installation",
        hr: "Instalacija softvera",
    });

    TagWrites.createTag(techSupport.category_id, {
        en: "Virus removal",
        hr: "Uklanjanje virusa",
    });

    TagWrites.createTag(techSupport.category_id, {
        en: "Data recovery",
        hr: "Povratak podataka",
    });

    TagWrites.createTag(techSupport.category_id, {
        en: "Network setup",
        hr: "Postavljanje mreže",
    });

    TagWrites.createTag(techSupport.category_id, {
        en: "Coding assistance",
        hr: "Pomoć pri kodiranju",
    });

    TagWrites.createTag(techSupport.category_id, {
        en: "Tech consulting",
        hr: "Tehnološko savjetovanje",
    });

    const errandsAndDelivery = (await CategoryReads.getCategoryById(8))!;

    TagWrites.createTag(errandsAndDelivery.category_id, {
        en: "Grocery shopping",
        hr: "Kupovina namirnica",
    });

    TagWrites.createTag(errandsAndDelivery.category_id, {
        en: "Package delivery",
        hr: "Dostava paketa",
    });

    TagWrites.createTag(errandsAndDelivery.category_id, {
        en: "Food delivery",
        hr: "Dostava hrane",
    });

    TagWrites.createTag(errandsAndDelivery.category_id, {
        en: "Pet care",
        hr: "Briga o kućnim ljubimcima",
    });

    TagWrites.createTag(errandsAndDelivery.category_id, {
        en: "Child or elder care",
        hr: "Briga o djeci ili starijima",
    });

    TagWrites.createTag(errandsAndDelivery.category_id, {
        en: "Event planning",
        hr: "Planiranje događaja",
    });

    const creativeAndDesign = (await CategoryReads.getCategoryById(9))!;

    TagWrites.createTag(creativeAndDesign.category_id, {
        en: "Logo design",
        hr: "Dizajn logotipa",
    });

    TagWrites.createTag(creativeAndDesign.category_id, {
        en: "Graphic design",
        hr: "Grafički dizajn",
    });

    TagWrites.createTag(creativeAndDesign.category_id, {
        en: "Video and photo editing",
        hr: "Uređivanje videa i fotografija",
    });

    TagWrites.createTag(creativeAndDesign.category_id, {
        en: "Photography",
        hr: "Fotografija",
    });

    TagWrites.createTag(creativeAndDesign.category_id, {
        en: "Music",
        hr: "Glazba",
    });

    TagWrites.createTag(creativeAndDesign.category_id, {
        en: "Writing",
        hr: "Pisanje",
    });

    TagWrites.createTag(creativeAndDesign.category_id, {
        en: "Translation",
        hr: "Prijevod",
    });

    TagWrites.createTag(creativeAndDesign.category_id, {
        en: "Voice acting",
        hr: "Glasovni glumac",
    });

    TagWrites.createTag(creativeAndDesign.category_id, {
        en: "Animation",
        hr: "Animacija",
    });

    const fitnessAndHealth = (await CategoryReads.getCategoryById(10))!;

    TagWrites.createTag(fitnessAndHealth.category_id, {
        en: "Fitness",
        hr: "Fitness",
    });

    TagWrites.createTag(fitnessAndHealth.category_id, {
        en: "Personal training",
        hr: "Osovni trening",
    });

    TagWrites.createTag(fitnessAndHealth.category_id, {
        en: "Yoga",
        hr: "Joga",
    });

    TagWrites.createTag(fitnessAndHealth.category_id, {
        en: "Nutrition",
        hr: "Prehrana",
    });

    TagWrites.createTag(fitnessAndHealth.category_id, {
        en: "Massage",
        hr: "Masaža",
    });

    TagWrites.createTag(fitnessAndHealth.category_id, {
        en: "Psychology",
        hr: "Psihologija",
    });

    TagWrites.createTag(fitnessAndHealth.category_id, {
        en: "Life coaching",
        hr: "Životno savjetovanje",
    });

    TagWrites.createTag(fitnessAndHealth.category_id, {
        en: "Sports",
        hr: "Sport",
    });

    TagWrites.createTag(fitnessAndHealth.category_id, {
        en: "Dancing",
        hr: "Ples",
    });

    const business = (await CategoryReads.getCategoryById(11))!;

    TagWrites.createTag(business.category_id, {
        en: "Marketing",
        hr: "Marketing",
    });

    TagWrites.createTag(business.category_id, {
        en: "Accounting",
        hr: "Računovodstvo",
    });

    TagWrites.createTag(business.category_id, {
        en: "Finance",
        hr: "Financije",
    });

    TagWrites.createTag(business.category_id, {
        en: "Legal",
        hr: "Pravno",
    });

    TagWrites.createTag(business.category_id, {
        en: "Business consulting",
        hr: "Poslovno savjetovanje",
    });

    TagWrites.createTag(business.category_id, {
        en: "Business planning",
        hr: "Voditelj projekta",
    });

    TagWrites.createTag(business.category_id, {
        en: "Resources",
        hr: "Resursi",
    });

    TagWrites.createTag(business.category_id, {
        en: "Sales",
        hr: "Prodaja",
    });

    TagWrites.createTag(business.category_id, {
        en: "Real estate",
        hr: "Nekretnine",
    });

    TagWrites.createTag(business.category_id, {
        en: "Data entry",
        hr: "Unos podataka",
    });

    const education = (await CategoryReads.getCategoryById(12))!;

    TagWrites.createTag(education.category_id, {
        en: "Tutoring",
        hr: "Podučavanje",
    });

    TagWrites.createTag(education.category_id, {
        en: "Language lessons",
        hr: "Nastava jezika",
    });

    TagWrites.createTag(education.category_id, {
        en: "Music lessons",
        hr: "Nastava glazbe",
    });

    TagWrites.createTag(education.category_id, {
        en: "Homework help",
        hr: "Pomoć pri domaćim zadacima",
    });

    TagWrites.createTag(education.category_id, {
        en: "Online classes",
        hr: "Online nastava",
    });

    TagWrites.createTag(education.category_id, {
        en: "Exam preparation",
        hr: "Priprema za ispite",
    });

    TagWrites.createTag(education.category_id, {
        en: "College application",
        hr: "Upis na fakultet",
    });

    const other = (await CategoryReads.getCategoryById(13))!;

    TagWrites.createTag(other.category_id, {
        en: "Miscellaneous",
        hr: "Razno",
    });

    TagWrites.createTag(other.category_id, {
        en: "Other",
        hr: "Ostalo",
    });
}
