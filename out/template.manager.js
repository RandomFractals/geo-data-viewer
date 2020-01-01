"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const config = require("./config");
const logger_1 = require("./logger");
/**
 * Template type for loading file templates
 * and template file content.
 */
class Template {
    constructor() {
        // template name
        this.name = '';
        // template file content
        this.content = '';
    }
}
exports.Template = Template;
/**
 * Template manager implementation for html and json files.
 */
class TemplateManager {
    /**
     * Creates new template manager and loads templates
     * from the specified template folder.
     * @param templateFolder Template folder to inspect.
     */
    constructor(templateFolder) {
        this.templateFolder = templateFolder;
        this.logger = new logger_1.Logger('template.manager:', config.logLevel);
        this.templates = this.loadTemplates();
    }
    /**
     * Loads .html and .json templates from the specified template folder.
     * @param templateFolder Template folder to inspect.
     */
    loadTemplates() {
        this.logger.debug('loadTemplates(): loading file templates... templateFolder:', this.templateFolder);
        const fileNames = fs.readdirSync(this.templateFolder)
            .filter(fileName => fileName.endsWith('.html') || fileName.endsWith('.json'));
        const templates = [];
        // TODO: change this to read file async ???
        fileNames.forEach(fileName => templates.push({ name: fileName, content: fs.readFileSync(path.join(this.templateFolder, fileName), 'utf8') }));
        this.logger.debug('loadTemplates(): templates:', fileNames);
        return templates;
    }
    /**
     * Gets file template with the specified name.
     * @param name Template name to find.
     */
    getTemplate(name) {
        return this.templates.find(template => template.name === name);
    }
}
exports.TemplateManager = TemplateManager;
//# sourceMappingURL=template.manager.js.map