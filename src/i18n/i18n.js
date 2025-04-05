import { createI18n } from "vue-i18n";
import { ref } from "vue"

const modules = import.meta.glob("./*.json", { eager: true });

const messages = Object.entries(modules).reduce((acc, [path, module]) => {
  const key = path.replace("./", "").replace(".json", "");
  acc[key] = module.default;
  return acc;
}, {});


const lang = ref(navigator.language || navigator.languages[0]);
const i18n = createI18n({
  locale: lang.value,
  fallbackLocale: "en",
  messages: messages,
});

export { i18n };
