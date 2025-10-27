// ==================== MODEL: ENCOUNTER ====================
class Encounter {
    constructor(id, text, options) {
        this.id = id;
        this.text = text;
        this.options = options;
    }
}

class EncounterOption {
    constructor(text, action) {
        this.text = text;
        this.action = action;
    }
}

