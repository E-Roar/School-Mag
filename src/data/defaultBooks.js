const texturePath = (name) => `/textures/${name}.jpg`;
export const defaultPagePlaceholder = texturePath("DSC00933");

export const defaultVisualSettings = {
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
    "DSC00933",
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

const createBook = (overrides = {}) => {
  const {
    visualSettings: visualOverrides = {},
    pages: pageOverrides,
    listOfContent = "",
    ...rest
  } = overrides;
  return {
    id:
      rest.id ??
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `book-${Math.random().toString(36).slice(2, 9)}`),
    title: "Campus Life",
    subtitle: "Art & Culture Edition",
    issueTag: "October 2025",
    heroImage: texturePath("book-cover"),
    releaseDate: "2025-10-01",
    pages: pageOverrides ?? buildPagesFromPictures(),
    visualSettings: {
      ...defaultVisualSettings,
      ...visualOverrides,
      marqueeTexts:
        visualOverrides.marqueeTexts && visualOverrides.marqueeTexts.length
          ? visualOverrides.marqueeTexts
          : defaultVisualSettings.marqueeTexts,
    },
    listOfContent,
    ...rest,
  };
};

export const defaultBooks = [
  createBook({
    id: "issue-fall",
    title: "Fall Issue",
    subtitle: "Arts Festival Special",
    issueTag: "Vol. 08",
    releaseDate: "2025-10-15",
    listOfContent:
      "Principal Letter; Arts Festival Recap; Student Spotlight: Mia Chen; Gallery Highlights; Upcoming Exhibitions",
    visualSettings: {
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
  }),
  createBook({
    id: "issue-winter",
    title: "Winter Issue",
    subtitle: "STEM Showcase",
    issueTag: "Vol. 09",
    heroImage: texturePath("DSC01145"),
    releaseDate: "2025-12-05",
    listOfContent:
      "Dean's Note; Innovation Week Winners; Robotics Lab Tour; Space Club Discoveries; Code Jam Results",
    visualSettings: {
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
  }),
];


