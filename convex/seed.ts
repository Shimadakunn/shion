import { mutation } from "./_generated/server";

export const seed = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("menuItems").first();
    if (existing) return "already seeded";

    // Settings
    await ctx.db.insert("settings", {
      address: "12 Rue de la Paix, 75002 Paris",
      phone: "+33 1 42 60 00 00",
      email: "contact@shion-paris.fr",
      socialLinks: {
        instagram: "https://instagram.com/shion.paris",
      },
    });

    // Schedule (closed Monday/Sunday, open Tue-Sat)
    const closedDays = [0, 1]; // Sunday, Monday
    for (let day = 0; day < 7; day++) {
      await ctx.db.insert("schedule", {
        dayOfWeek: day,
        isOpen: !closedDays.includes(day),
        services: closedDays.includes(day)
          ? []
          : [
              {
                name: "Midi",
                openTime: "12:00",
                closeTime: "14:30",
                maxCovers: 30,
              },
              {
                name: "Soir",
                openTime: "19:00",
                closeTime: "22:30",
                maxCovers: 35,
              },
            ],
      });
    }

    // Menu Items — Entrées
    const e1 = await ctx.db.insert("menuItems", {
      category: "entrees",
      service: "both",
      name: {
        fr: "Tartare de daurade, yuzu et shiso",
        en: "Sea bream tartare, yuzu & shiso",
        jp: "鯛のタルタル 柚子と紫蘇",
      },
      description: {
        fr: "Daurade sauvage marinée, émulsion yuzu, pousses de shiso rouge",
        en: "Wild sea bream marinated, yuzu emulsion, red shiso shoots",
        jp: "天然鯛のマリネ、柚子のエミュルション、赤紫蘇の新芽",
      },
      price: 18,
      order: 1,
      isActive: true,
    });

    const e2 = await ctx.db.insert("menuItems", {
      category: "entrees",
      service: "both",
      name: {
        fr: "Foie gras mi-cuit, gelée de saké",
        en: "Semi-cooked foie gras, sake jelly",
        jp: "フォアグラのミキュイ 日本酒のジュレ",
      },
      description: {
        fr: "Foie gras de canard mi-cuit, gelée de saké Dassai, brioche toastée",
        en: "Duck foie gras semi-cooked, Dassai sake jelly, toasted brioche",
        jp: "鴨のフォアグラ・ミキュイ、獺祭のジュレ、トーストしたブリオッシュ",
      },
      price: 24,
      order: 2,
      isActive: true,
    });

    await ctx.db.insert("menuItems", {
      category: "entrees",
      service: "dinner",
      name: {
        fr: "Huîtres, ponzu et finger lime",
        en: "Oysters, ponzu & finger lime",
        jp: "牡蠣のポン酢 フィンガーライム添え",
      },
      description: {
        fr: "Huîtres spéciales n°2, sauce ponzu maison, perles de finger lime",
        en: "Special n°2 oysters, house ponzu sauce, finger lime pearls",
        jp: "特撰牡蠣、自家製ポン酢、フィンガーライムの粒",
      },
      price: 22,
      order: 3,
      isActive: true,
    });

    // Menu Items — Plats
    const p1 = await ctx.db.insert("menuItems", {
      category: "plats",
      service: "both",
      name: {
        fr: "Filet de bar, dashi et légumes racines",
        en: "Sea bass fillet, dashi & root vegetables",
        jp: "スズキのフィレ 出汁と根菜",
      },
      description: {
        fr: "Bar de ligne, bouillon dashi aux champignons, topinambour et panais rôtis",
        en: "Line-caught bass, mushroom dashi broth, roasted sunchoke & parsnip",
        jp: "天然スズキ、きのこ出汁、ローストした菊芋とパースニップ",
      },
      price: 34,
      order: 4,
      isActive: true,
    });

    const p2 = await ctx.db.insert("menuItems", {
      category: "plats",
      service: "both",
      name: {
        fr: "Wagyu A5, sauce teriyaki truffe",
        en: "A5 Wagyu, truffle teriyaki sauce",
        jp: "A5和牛 トリュフ照り焼きソース",
      },
      description: {
        fr: "Wagyu de Miyazaki A5, sauce teriyaki à la truffe noire, purée de céleri rave",
        en: "Miyazaki A5 Wagyu, black truffle teriyaki sauce, celeriac purée",
        jp: "宮崎A5和牛、黒トリュフ照り焼きソース、セロリアックのピューレ",
      },
      price: 58,
      order: 5,
      isActive: true,
    });

    await ctx.db.insert("menuItems", {
      category: "plats",
      service: "lunch",
      name: {
        fr: "Poulet fermier, miso blanc et gingembre",
        en: "Free-range chicken, white miso & ginger",
        jp: "地鶏の白味噌生姜焼き",
      },
      description: {
        fr: "Suprême de poulet fermier, glace au miso blanc, condiment gingembre-citron",
        en: "Free-range chicken supreme, white miso glaze, ginger-lemon condiment",
        jp: "地鶏のシュプレーム、白味噌のグレーズ、生姜レモンの薬味",
      },
      price: 28,
      order: 6,
      isActive: true,
    });

    // Menu Items — Desserts
    const d1 = await ctx.db.insert("menuItems", {
      category: "desserts",
      service: "both",
      name: {
        fr: "Matcha fondant, crème anglaise au sésame noir",
        en: "Matcha fondant, black sesame crème anglaise",
        jp: "抹茶フォンダン 黒ごまクレームアングレーズ",
      },
      description: {
        fr: "Fondant au thé matcha d'Uji, crème anglaise sésame noir torréfié",
        en: "Uji matcha tea fondant, toasted black sesame crème anglaise",
        jp: "宇治抹茶のフォンダン、焙煎黒ごまのクレームアングレーズ",
      },
      price: 14,
      order: 7,
      isActive: true,
    });

    await ctx.db.insert("menuItems", {
      category: "desserts",
      service: "both",
      name: {
        fr: "Mochi glacé, fruits de saison",
        en: "Ice cream mochi, seasonal fruits",
        jp: "アイスもち 季節のフルーツ",
      },
      description: {
        fr: "Trio de mochis glacés maison, fruits frais de saison",
        en: "Trio of house-made ice cream mochi, fresh seasonal fruits",
        jp: "自家製アイスもち三種盛り、旬のフルーツ添え",
      },
      price: 12,
      order: 8,
      isActive: true,
    });

    // Formules
    await ctx.db.insert("formules", {
      service: "lunch",
      name: {
        fr: "Menu Déjeuner",
        en: "Lunch Menu",
        jp: "ランチメニュー",
      },
      description: {
        fr: "Entrée + Plat ou Plat + Dessert",
        en: "Starter + Main or Main + Dessert",
        jp: "前菜＋メイン または メイン＋デザート",
      },
      price: 35,
      includedItemIds: [e1, p1, d1],
      order: 1,
      isActive: true,
    });

    await ctx.db.insert("formules", {
      service: "lunch",
      name: {
        fr: "Menu Découverte Midi",
        en: "Lunch Discovery Menu",
        jp: "ランチディスカバリーメニュー",
      },
      description: {
        fr: "Entrée + Plat + Dessert",
        en: "Starter + Main + Dessert",
        jp: "前菜＋メイン＋デザート",
      },
      price: 45,
      includedItemIds: [e1, e2, p1, p2, d1],
      order: 2,
      isActive: true,
    });

    await ctx.db.insert("formules", {
      service: "dinner",
      name: {
        fr: "Menu Omakase",
        en: "Omakase Menu",
        jp: "おまかせメニュー",
      },
      description: {
        fr: "5 services surprise du chef, accords mets et sakés en option",
        en: "5-course chef's surprise menu, optional food and sake pairings",
        jp: "シェフのおまかせ5皿コース、日本酒ペアリングオプション有",
      },
      price: 85,
      includedItemIds: [e1, e2, p1, p2, d1],
      order: 3,
      isActive: true,
    });

    return "seeded successfully";
  },
});
