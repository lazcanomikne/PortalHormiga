// src/stores/usePageNavigationStore.js
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useArticuloDefinicionesStore } from "./useArticuloDefinicionesStore";
import { useBahiaDefinicionesStore } from "./useBahiaDefinicionesStore";

export const usePageNavigationStore = defineStore("pageNavigation", () => {
  // State
  const pageNavigation = ref([]);
  const currentPageId = ref(null);
  const isGenerating = ref(false);
  const currentTab = ref(null);

  // Getters
  const hasNavigation = computed(() => pageNavigation.value.length > 0);
  const navigationByPage = computed(() => {
    return pageNavigation.value.filter(
      (item) => item.pageId === currentPageId.value
    );
  });

  // Actions
  const getIconForTag = (tagName) => {
    const iconMap = {
      H1: "mdi-format-header-1",
      H2: "mdi-format-header-2",
      H3: "mdi-format-header-3",
      H4: "mdi-format-header-4",
      H5: "mdi-format-header-5",
      H6: "mdi-format-header-6",
      SECTION: "mdi-view-dashboard",
      ARTICLE: "mdi-file-document",
      DIV: "mdi-navigation",
      MAIN: "mdi-home",
      ASIDE: "mdi-sidebar",
      NAV: "mdi-navigation",
      HEADER: "mdi-format-header-pound",
      FOOTER: "mdi-format-footer",
      FORM: "mdi-form-select",
      TABLE: "mdi-table",
      UL: "mdi-format-list-bulleted",
      OL: "mdi-format-list-numbered",
      DEFAULT: "mdi-tag",
    };
    return iconMap[tagName.toUpperCase()] || iconMap["DEFAULT"];
  };

  const generatePageNavigation = (pageId = null, options = {}) => {
    isGenerating.value = true;

    try {
      // Si no se proporciona pageId, usar la ruta actual
      const targetPageId = pageId || window.location.pathname;
      currentPageId.value = targetPageId;

      // Limpiar navegación anterior para esta página
      pageNavigation.value = pageNavigation.value.filter(
        (item) => item.pageId !== targetPageId
      );

      // Obtener todos los elementos con ID
      const elementsWithId = document.querySelectorAll("button[role='tab']");

      // Filtros opcionales
      const {
        includeTags = [], // Array de tags a incluir (ej: ['H1', 'H2', 'SECTION'])
        excludeTags = [], // Array de tags a excluir (ej: ['DIV', 'SPAN'])
        minTextLength = 1, // Longitud mínima del texto
        maxTextLength = 100, // Longitud máxima del texto
        customSelector = null, // Selector CSS personalizado
        includeHidden = false, // Incluir elementos ocultos
      } = options;

      let filteredElements = Array.from(elementsWithId);

      // Aplicar filtros
      if (includeTags.length > 0) {
        filteredElements = filteredElements.filter((el) =>
          includeTags.includes(el.tagName)
        );
      }

      if (excludeTags.length > 0) {
        filteredElements = filteredElements.filter(
          (el) => !excludeTags.includes(el.tagName)
        );
      }

      if (customSelector) {
        filteredElements = filteredElements.filter((el) =>
          el.matches(customSelector)
        );
      }

      if (!includeHidden) {
        filteredElements = filteredElements.filter((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden";
        });
      }

      // Procesar elementos
      filteredElements.forEach((element) => {
        const id = element.value;
        const tagName = element.tagName;
        const text = element.getAttribute("aria-label") || id;

        // Validar longitud del texto
        if (
          text &&
          text.length >= minTextLength &&
          text.length <= maxTextLength
        ) {
          pageNavigation.value.push({
            id: id,
            text: text,
            icon: getIconForTag(tagName),
            tagName: tagName,
            pageId: targetPageId,
            level: getHeaderLevel(tagName),
            element: element,
          });
        }
      });

      // Ordenar por posición en el DOM
      pageNavigation.value.sort((a, b) => {
        const elementA = document.getElementById(a.id);
        const elementB = document.getElementById(b.id);
        if (!elementA || !elementB) return 0;

        const position = elementA.compareDocumentPosition(elementB);
        return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });

      return pageNavigation.value.filter(
        (item) => item.pageId === targetPageId
      );
    } catch (error) {
      console.error("Error generating page navigation:", error);
      return [];
    } finally {
      isGenerating.value = false;
    }
  };

  const getHeaderLevel = (tagName) => {
    const match = tagName.match(/H(\d)/);
    return match ? parseInt(match[1]) : 0;
  };

  const scrollToElement = (navItem) => {
    currentTab.value = navItem.id;
    if (navItem.pageId.includes("ArticuloDefiniciones")) {
      const definicionesStore = useArticuloDefinicionesStore();
      definicionesStore.updateCurrentTab(navItem.id);
    } else {
      const bahiaDefinicionesStore = useBahiaDefinicionesStore();
      bahiaDefinicionesStore.updateCurrentTab(navItem.id);
    }
  };
  const updateCurrentTab = (tab) => {
    currentTab.value = tab;
  };
  const clearNavigation = (pageId = null) => {
    if (pageId) {
      pageNavigation.value = pageNavigation.value.filter(
        (item) => item.pageId !== pageId
      );
    } else {
      pageNavigation.value = [];
    }
  };

  const clearAllNavigation = () => {
    pageNavigation.value = [];
    currentPageId.value = null;
  };

  const getNavigationForPage = (pageId) => {
    return pageNavigation.value.filter((item) => item.pageId === pageId);
  };

  const updateNavigationItem = (id, updates) => {
    const index = pageNavigation.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      pageNavigation.value[index] = {
        ...pageNavigation.value[index],
        ...updates,
      };
    }
  };

  const removeNavigationItem = (id) => {
    const index = pageNavigation.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      pageNavigation.value.splice(index, 1);
    }
  };

  const refreshCurrentPageNavigation = (options = {}) => {
    if (currentPageId.value) {
      return generatePageNavigation(currentPageId.value, options);
    }
    return [];
  };

  return {
    // State
    pageNavigation,
    currentPageId,
    isGenerating,
    currentTab,
    // Getters
    hasNavigation,
    navigationByPage,

    // Actions
    generatePageNavigation,
    scrollToElement,
    clearNavigation,
    clearAllNavigation,
    getNavigationForPage,
    updateNavigationItem,
    removeNavigationItem,
    refreshCurrentPageNavigation,
    getIconForTag,
    updateCurrentTab,
  };
});
