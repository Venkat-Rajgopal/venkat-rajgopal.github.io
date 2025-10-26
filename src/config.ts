export const SITE = {
  website: "https://venkat-rajgopal.github.io",
  author: "Venkatramani Rajgopal",
  profile: "https://satnaing.dev/",
  desc: "A minimal Blog page.",
  title: "Echos 📣",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
<<<<<<< HEAD
    text: "Suggest Changes",
    url: "https://github.com/venkat-rajgopal/venkat-rajgopal.github.io/edit/main/",
=======
    text: "Edit page",
    url: "https://github.com/satnaing/astro-paper/edit/main/",
>>>>>>> upstream/main
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Europe/Berlin", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
