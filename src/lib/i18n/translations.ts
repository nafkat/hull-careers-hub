export const translations = {
  el: {
    // Hero
    hero: {
      eyebrow: "Ναυπηγεία · Ελλάδα",
      tagline: "ΙΔΕΕΣ ΠΟΥ ΠΛΕΟΥΝ",
      subTagline: "Ελάτε στην ομάδα που χτίζει το μέλλον της ναυτιλίας",
      cta: "ΕΝΤΑΞΗ ΣΤΟ ΝΑΥΠΗΓΕΙΟ",
      scrollIndicator: "Κύλιση προς τις θέσεις",
    },
    // Navigation
    nav: {
      home: "Αρχική",
      positions: "Θέσεις",
      about: "Σχετικά",
      admin: "Διαχείριση",
    },
    // Job Listings
    jobs: {
      eyebrow: "Καριέρα",
      nowHiring: "Προσλαμβάνουμε",
      title: "Ανοιχτές Θέσεις",
      subtitle:
        "θέσεις στα ναυπηγεία μας στον Ελευσίνα και τον Πειραιά. Κάθε αίτηση ελέγχεται από την ομάδα που θα δουλέψει μαζί σας.",
      viewAll: "Δείτε και τις {count} θέσεις",
      emptyTitle: "Δεν υπάρχουν ανοιχτές θέσεις αυτή τη στιγμή",
      emptySubtitle: "Επιστρέψτε σύντομα για νέες ευκαιρίες",
      department: "Τμήμα",
      location: "Τοποθεσία",
      type: "Τύπος απασχόλησης",
      apply: "Αίτηση",
      fullTime: "Πλήρης απασχόληση",
      partTime: "Μερική απασχόληση",
      contract: "Σύμβαση έργου",
    },
    // Landing pillars (technical specs)
    pillars: {
      hulls: {
        title: "Σκάφη 90m",
        text: "Σκάφη υποστήριξης υπεράκτιων εργασιών, ολοκληρωμένα στην Ελευσίνα.",
      },
      propulsion: {
        title: "Υβριδική πρόωση",
        text: "Ηλεκτροκινούμε τον παράκτιο στόλο του Αιγαίου από το 2019.",
      },
      crew: {
        title: "1.400 συνεργάτες",
        text: "Συγκολλητές, αρχιτέκτονες, σχεδιαστές και planners σε ένα ναυπηγείο.",
      },
    },
    // Job Detail
    detail: {
      backToPositions: "← Όλες οι θέσεις",
      aboutRole: "Περιγραφή θέσης",
      requirements: "Απαιτήσεις",
      applyNow: "Υποβολή αίτησης",
      company: "Ναυπηγεία EUROHULL",
      notListed: "Η θέση δεν είναι πλέον διαθέσιμη",
      viewAllRoles: "Δείτε όλες τις ανοιχτές θέσεις",
    },
    // Apply Modal
    apply: {
      title: "Υποβολή Αίτησης",
      fullName: "Ονοματεπώνυμο",
      fullNamePlaceholder: "π.χ. Γιώργος Παπαδόπουλος",
      email: "Email",
      emailPlaceholder: "your@email.com",
      phone: "Τηλέφωνο (προαιρετικό)",
      phonePlaceholder: "+30 210 ...",
      coverMessage: "Σύντομο μήνυμα (προαιρετικό)",
      coverMessagePlaceholder: "Γιατί θέλετε να εργαστείτε στο EUROHULL;",
      coverMessageHint: "Μέγιστο 500 χαρακτήρες",
      charsLeft: "χαρακτήρες απομένουν",
      cvLabel: "Βιογραφικό",
      fileUpload: "Σύρετε το βιογραφικό σας εδώ ή κάντε κλικ για επιλογή",
      fileTypes: "Μόνο PDF και DOCX, μέγιστο 10MB",
      fileSelected: "Επιλεγμένο αρχείο",
      fileSize: "Μέγεθος",
      removeFile: "Αφαίρεση",
      verifying: "Επαλήθευση μορφής αρχείου...",
      largeFile: "Μεγάλο αρχείο — η μεταφόρτωση μπορεί να πάρει λίγο",
      uploading: "Μεταφόρτωση βιογραφικού",
      submit: "ΥΠΟΒΟΛΗ ΑΙΤΗΣΗΣ",
      submitting: "ΕΠΕΞΕΡΓΑΣΙΑ...",
      successTitle: "Η ΑΙΤΗΣΗ ΥΠΟΒΛΗΘΗΚΕ",
      successMessage:
        "Λάβαμε την αίτησή σας. Ένα email επιβεβαίωσης στάλθηκε στη διεύθυνσή σας.",
      backToPositions: "Επιστροφή στις θέσεις",
      tryAnother: "Δοκιμάστε άλλο αρχείο",
      close: "Κλείσιμο",
    },
    // Validation errors
    errors: {
      nameRequired: "Το ονοματεπώνυμο είναι υποχρεωτικό",
      emailRequired: "Το email είναι υποχρεωτικό",
      emailInvalid: "Παρακαλώ εισάγετε ένα έγκυρο email",
      fileRequired: "Παρακαλώ επισυνάψτε το βιογραφικό σας",
      fileTypeInvalid: "Μόνο αρχεία PDF και DOCX επιτρέπονται",
      fileTooLarge: "Το αρχείο υπερβαίνει το όριο των 10MB",
      dailyLimit:
        "Έχετε φτάσει το ημερήσιο όριο αιτήσεων (3 ανά ημέρα). Δοκιμάστε αύριο.",
      scanInfected: "Εντοπίστηκε απειλή στο αρχείο. Η αίτηση απορρίφθηκε.",
      scanReview:
        "Δεν ήταν δυνατή η ολοκλήρωση της σάρωσης. Η αίτησή σας καταχωρήθηκε και η ομάδα μας θα την ελέγξει χειροκίνητα.",
      generic: "Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.",
    },
    // Virus scan
    scan: {
      scanning: "Σάρωση αρχείου για ιούς...",
      checking: "Έλεγχος του {file} για απειλές.",
      clean: "✓ Το αρχείο είναι ασφαλές",
      infected: "✗ Εντοπίστηκε απειλή",
      error: "Σφάλμα σάρωσης",
      pending: "Σε αναμονή",
    },
    // Footer
    footer: {
      tagline:
        "Χτίζοντας το μέλλον της ναυτιλίας — Ναυπηγεία Ελευσίνας & Πειραιά, Ελλάδα.",
      rights: "Ναυπηγεία EUROHULL. Με επιφύλαξη παντός δικαιώματος.",
      address: "Νέα Σμύρνη, Αθήνα",
    },
    // 404
    notFound: {
      title: "Η σελίδα δεν βρέθηκε",
      subtitle: "Αυτό το τμήμα του ναυπηγείου είναι υπό κατασκευή.",
      cta: "Επιστροφή στην αποβάθρα",
    },
    // Generic
    loading: "Φόρτωση",
    // Language switcher
    lang: {
      el: "Ελληνικά",
      en: "English",
    },
  },
  en: {
    hero: {
      eyebrow: "Shipyards · Greece",
      tagline: "IDEAS THAT FLOAT",
      subTagline: "Join the team building the future of maritime",
      cta: "JOIN THE YARD",
      scrollIndicator: "Scroll to positions",
    },
    nav: {
      home: "Home",
      positions: "Positions",
      about: "About",
      admin: "Admin",
    },
    jobs: {
      eyebrow: "Careers",
      nowHiring: "Now hiring",
      title: "Open Positions",
      subtitle:
        "roles across our Elefsina and Piraeus yards. Every application is reviewed by the team that will work beside you.",
      viewAll: "View all {count} roles",
      emptyTitle: "No positions currently open",
      emptySubtitle: "Check back soon for new opportunities",
      department: "Department",
      location: "Location",
      type: "Employment Type",
      apply: "Apply",
      fullTime: "Full-time",
      partTime: "Part-time",
      contract: "Contract",
    },
    pillars: {
      hulls: {
        title: "90m hulls",
        text: "Offshore support vessels built end-to-end in Elefsina.",
      },
      propulsion: {
        title: "Hybrid propulsion",
        text: "Electrifying the Aegean coastal fleet since 2019.",
      },
      crew: {
        title: "1,400 crew",
        text: "Welders, architects, planners and designers in one yard.",
      },
    },
    detail: {
      backToPositions: "← All positions",
      aboutRole: "About the role",
      requirements: "What we're looking for",
      applyNow: "Apply now",
      company: "EUROHULL Shipyards",
      notListed: "This position is no longer listed",
      viewAllRoles: "View all open roles",
    },
    apply: {
      title: "Submit Application",
      fullName: "Full Name",
      fullNamePlaceholder: "e.g. John Papadopoulos",
      email: "Email",
      emailPlaceholder: "your@email.com",
      phone: "Phone (optional)",
      phonePlaceholder: "+30 210 ...",
      coverMessage: "Cover message (optional)",
      coverMessagePlaceholder: "Why do you want to work at EUROHULL?",
      coverMessageHint: "Maximum 500 characters",
      charsLeft: "characters left",
      cvLabel: "CV / Resume",
      fileUpload: "Drop your CV here or click to browse",
      fileTypes: "PDF and DOCX only, max 10MB",
      fileSelected: "Selected file",
      fileSize: "Size",
      removeFile: "Remove",
      verifying: "Verifying file format...",
      largeFile: "Large file — upload may take a moment",
      uploading: "Uploading your CV",
      submit: "SUBMIT APPLICATION",
      submitting: "PROCESSING...",
      successTitle: "APPLICATION RECEIVED",
      successMessage:
        "We received your application. A confirmation email has been sent to your address.",
      backToPositions: "Back to positions",
      tryAnother: "Try another file",
      close: "Close",
    },
    errors: {
      nameRequired: "Full name is required",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email",
      fileRequired: "Please attach your CV",
      fileTypeInvalid: "Only PDF and DOCX files are allowed",
      fileTooLarge: "File exceeds the 10MB limit",
      dailyLimit:
        "You have reached the daily application limit (3 per day). Please try again tomorrow.",
      scanInfected: "Threat detected in file. Application rejected.",
      scanReview:
        "We could not complete the virus scan. Your application was received and our team will review it manually.",
      generic: "Something went wrong. Please try again.",
    },
    scan: {
      scanning: "Scanning file for threats...",
      checking: "Checking {file} for threats.",
      clean: "✓ File is safe",
      infected: "✗ Threat detected",
      error: "Scan error",
      pending: "Pending",
    },
    footer: {
      tagline: "Building the Future of Maritime — Elefsina & Piraeus shipyards, Greece.",
      rights: "EUROHULL Shipyards. All rights reserved.",
      address: "Nea Smyrni, Athens",
    },
    notFound: {
      title: "Page not found",
      subtitle: "This section of the yard is under construction.",
      cta: "Return to dock",
    },
    loading: "Loading",
    lang: {
      el: "Ελληνικά",
      en: "English",
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.el;
export type Language = "el" | "en";

/** Map a DB employment_type value to a localized label. Falls back to the raw value. */
export function employmentTypeLabel(type: string, lang: Language): string {
  const normalized = type.toLowerCase().replace(/[\s-]+/g, "_");
  const map: Record<string, "fullTime" | "partTime" | "contract"> = {
    full_time: "fullTime",
    fulltime: "fullTime",
    part_time: "partTime",
    parttime: "partTime",
    contract: "contract",
  };
  const key = map[normalized];
  return key ? translations[lang].jobs[key] : type;
}
