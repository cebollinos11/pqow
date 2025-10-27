// ==================== ENCOUNTER: ACTION CREATORS ====================
const Actions = {
    genericFight: (difficulty, skill = 'Combat Training') => {
        return (game) => {
            game.state.pendingRoll = {
                difficulty,
                skill,
                onResult: (outcome) => {
                    if (outcome === 'GS') {
                        game.state.addLog('⚔️ Victory! You defeated your enemy!', 'success');
                        game.checkGameOver();
                        game.nextEncounter();
                    } else if (outcome === 'MS') {
                        game.distributeWounds(1, () => {
                            game.state.addLog('⚔️ Victory, but wounds were taken in the fight.', 'warning');
                            game.checkGameOver();
                            game.nextEncounter();
                        });
                    } else {
                        game.distributeWounds(3, () => {
                            game.state.addLog('⚔️ Victory, but heavy wounds were taken in the brutal fight!', 'danger');
                            game.checkGameOver();
                            game.nextEncounter();
                        });
                    }
                }
            };
            game.promptForLuck();
        };
    },
    
    skillCheck: (difficulty, skill, outcomes) => {
        return (game) => {
            game.state.pendingRoll = {
                difficulty,
                skill,
                onResult: (outcome) => {
                    if (outcomes[outcome]) {
                        outcomes[outcome](game);
                    }
                    game.checkGameOver();
                    game.nextEncounter();
                }
            };
            game.promptForLuck();
        };
    },
    
    direct: (callback) => {
        return (game) => {
            callback(game);
            game.nextEncounter();
        };
    }
};

