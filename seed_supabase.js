import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = 'https://iqiijwnxixnucpsatweq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaWlqd254aXhudWNwc2F0d2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzE4NzYsImV4cCI6MjA3OTMwNzg3Nn0.r8bMLgXnRxIXQdn8ERouppgij_OPWsM6irOJB1AbbSA'

const supabase = createClient(supabaseUrl, supabaseKey)

const texturePath = (name) => `/textures/${name}.jpg`;

const defaultVisualSettings = {
    marqueeTexts: [
        "Wawa Sensei",
        "React Three Fiber",
        "Three.js",
        "Ultimate Guide",
        "Tutorials",
        "Learn",
        "Practice",
        "Creative",
    ],
    marqueeFontFamily: "'Poppins', sans-serif",
    marqueeColor: "#ffffff",
    marqueeSpeed: 16,
    gradientStart: "#5a47ce",
    gradientEnd: "#232323",
    floatIntensity: 1,
    rotationIntensity: 2,
    floatSpeed: 2,
};

const buildPagesFromPictures = () => {
    const pictures = [
        "DSC00680",
        "DSC00933",
        "DSC00966",
        "DSC00983",
        "DSC01011",
        "DSC01040",
        "DSC01064",
        "DSC01071",
        "DSC01103",
        "DSC01145",
        "DSC01420",
        "DSC01461",
        "DSC01489",
        "DSC02031",
        "DSC02064",
        "DSC02069",
    ];

    const pages = [
        {
            frontSrc: texturePath("book-cover"),
            backSrc: texturePath(pictures[0]),
            label: "Cover",
        },
    ];

    for (let i = 1; i < pictures.length - 1; i += 2) {
        pages.push({
            frontSrc: texturePath(pictures[i % pictures.length]),
            backSrc: texturePath(pictures[(i + 1) % pictures.length]),
            label: `Spread ${Math.ceil(i / 2)}`,
        });
    }

    pages.push({
        frontSrc: texturePath(pictures[pictures.length - 1]),
        backSrc: texturePath("book-back"),
        label: "Back Cover",
    });

    return pages;
};

const booksToSeed = [
    {
        title: "Fall Issue",
        subtitle: "Arts Festival Special",
        issue_tag: "Vol. 08",
        release_date: "2025-10-15",
        list_of_content: "Principal Letter; Arts Festival Recap; Student Spotlight: Mia Chen; Gallery Highlights; Upcoming Exhibitions",
        hero_image_path: texturePath("book-cover"),
        visual_settings: {
            ...defaultVisualSettings,
            marqueeTexts: [
                "Fall Arts",
                "Student Gallery",
                "Spotlights",
                "Design Lab",
                "Creative Voices",
            ],
            marqueeColor: "#ffefd5",
            marqueeFontFamily: "'Playfair Display', serif",
            gradientStart: "#FF6F91",
            gradientEnd: "#2B2E4A",
        },
        is_published: true
    },
    {
        title: "Winter Issue",
        subtitle: "STEM Showcase",
        issue_tag: "Vol. 09",
        release_date: "2025-12-05",
        list_of_content: "Dean's Note; Innovation Week Winners; Robotics Lab Tour; Space Club Discoveries; Code Jam Results",
        hero_image_path: texturePath("DSC01145"),
        visual_settings: {
            ...defaultVisualSettings,
            marqueeTexts: [
                "Innovation Week",
                "Robotics",
                "Astronomy",
                "Code Jam",
                "Future Ready",
            ],
            marqueeColor: "#b3f0ff",
            marqueeFontFamily: "'Space Grotesk', sans-serif",
            gradientStart: "#0F2027",
            gradientEnd: "#2C5364",
        },
        is_published: true
    }
];

async function seed() {
    console.log('Seeding Supabase...');

    for (const bookData of booksToSeed) {
        const bookId = randomUUID();
        console.log(`Creating book: ${bookData.title} (${bookId})`);

        const { error: bookError } = await supabase
            .from('books')
            .insert({
                id: bookId,
                ...bookData
            });

        if (bookError) {
            console.error('Error inserting book:', bookError);
            continue;
        }

        const pages = buildPagesFromPictures();
        const pagesData = pages.map((page, index) => ({
            book_id: bookId,
            page_number: index,
            front_asset_path: page.frontSrc,
            back_asset_path: page.backSrc,
            label: page.label
        }));

        const { error: pagesError } = await supabase
            .from('pages')
            .insert(pagesData);

        if (pagesError) {
            console.error('Error inserting pages:', pagesError);
        } else {
            console.log(`Inserted ${pagesData.length} pages for book ${bookData.title}`);
        }
    }

    console.log('Seeding complete.');
}

seed();
