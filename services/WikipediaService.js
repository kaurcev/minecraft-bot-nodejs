const axios = require("axios");

/**
 * Service for handling Wikipedia API requests
 * @class WikipediaService
 */
class WikipediaService {
  /**
   * Fetch definition from Wikipedia
   * @param {string} query - Search query
   * @returns {Promise<string>} Definition text
   */
  async fetchDefinition(query) {
    try {
      const response = await axios.get("https://ru.wikipedia.org/w/api.php", {
        params: {
          action: "query",
          format: "json",
          prop: "extracts",
          exintro: true,
          explaintext: true,
          titles: query,
        },
      });

      const pages = response.data.query.pages;
      const page = Object.values(pages)[0];
      
      if (!page.extract) {
        return "Извини, я не смогла найти определение.";
      }

      return page.extract.length > 200 
        ? `${page.extract.substring(0, 200)}...`
        : page.extract;
    } catch (error) {
      return "Извини, я не смогла найти определение.";
    }
  }
}

module.exports = WikipediaService;