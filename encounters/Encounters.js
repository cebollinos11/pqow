// ==================== DATA: ENCOUNTERS ====================
const ENCOUNTERS = [
    new Encounter(
        'bear',
        'You encounter a massive bear blocking your path through the forest. Its eyes watch you carefully.',
        [
            new EncounterOption('⚔️ Fight the bear!', Actions.genericFight(16, 'Combat Training')),
            new EncounterOption('🐻 Try to pacify the bear', Actions.skillCheck(14, 'Animal Handling', {
                'GS': (game) => {
                    const bear = new Character('Bear Companion', 3, 3, 1);
                    bear.addSkill('Combat Training');
                    game.state.addCompanion(bear);
                    game.state.addLog('🐻 The bear nuzzles you gently and joins your party!', 'success');
                },
                'MS': (game) => {
                    game.distributeWounds(1, () => {
                        game.state.addLog('🐻 The bear swipes at you before running away.', 'warning');
                    });
                },
                'BS': (game) => {
                    game.distributeWounds(1, () => {
                        game.state.addLog('🐻 The bear attacks! You must fight!', 'danger');
                        Actions.genericFight(16, 'Combat Training')(game);
                    });
                }
            })),
            new EncounterOption('🏃 Run away', Actions.direct((game) => {
                game.state.addLog('You flee from the bear and continue on your journey.', 'info');
            }))
        ]
    ),
    
    new Encounter(
        'merchant',
        'A traveling merchant approaches you with a friendly smile. "Looking to trade?"',
        [
            new EncounterOption('🍞 Buy food (costs 1 luck)', Actions.direct((game) => {
                if (game.state.player.luck > 0) {
                    game.state.player.useLuck();
                    game.state.player.addFood(3);
                    game.state.addLog('Purchased 3 food for 1 luck.', 'success');
                } else {
                    game.state.addLog('Not enough luck!', 'danger');
                }
            })),
            new EncounterOption('🗡️ Rob the merchant', Actions.skillCheck(15, 'Pickpocketing', {
                'GS': (game) => {
                    game.state.player.addFood(2);
                    game.state.player.addLuck(1);
                    game.state.player.addToInventory('Stolen Goods');
                    game.state.addLog('Successfully robbed the merchant! Gained food, luck, and items.', 'success');
                },
                'MS': (game) => {
                    game.state.player.addFood(1);
                    game.state.addLog('You got some food, but the merchant noticed you!', 'warning');
                },
                'BS': (game) => {
                    game.distributeWounds(2, () => {
                        game.state.addLog('The merchant\'s guards caught you!', 'danger');
                    });
                }
            })),
            new EncounterOption('👋 Leave peacefully', Actions.direct((game) => {
                game.state.addLog('You wave goodbye to the merchant.', 'info');
            }))
        ]
    ),
    
    new Encounter(
        'locked_chest',
        'You discover an old locked chest partially buried in the ground.',
        [
            new EncounterOption('🔓 Pick the lock', Actions.skillCheck(12, 'Lockpicking', {
                'GS': (game) => {
                    game.state.player.addLuck(2);
                    game.state.player.addToInventory('Golden Coin');
                    game.state.addLog('Successfully picked the lock! Found luck and treasure!', 'success');
                },
                'MS': (game) => {
                    game.state.player.addLuck(1);
                    game.state.addLog('You managed to open it, but your lockpick broke.', 'warning');
                },
                'BS': (game) => {
                    game.distributeWounds(1, () => {
                        game.state.addLog('The chest was trapped! It exploded.', 'danger');
                    });
                }
            })),
            new EncounterOption('💪 Smash it open', Actions.direct((game) => {
                const outcome = Math.random();
                if (outcome > 0.5) {
                    game.state.player.addToInventory('Broken Treasure');
                    game.state.addLog('You smashed it open and found some broken items.', 'warning');
                } else {
                    game.distributeWounds(1, () => {
                        game.state.addLog('The chest was too sturdy. You hurt yourself.', 'danger');
                    });
                }
            })),
            new EncounterOption('🚶 Leave it', Actions.direct((game) => {
                game.state.addLog('You decide not to risk it and continue on.', 'info');
            }))
        ]
    ),
    
    new Encounter(
        'bandit',
        'A bandit jumps out from behind a tree! "Your gold or your life!"',
        [
            new EncounterOption('⚔️ Fight!', Actions.genericFight(14, 'Combat Training')),
            new EncounterOption('💰 Give 2 food', Actions.direct((game) => {
                if (game.state.player.food >= 2) {
                    game.state.player.removeFood(2);
                    game.state.addLog('You gave the bandit food and he let you pass.', 'warning');
                } else {
                    game.state.addLog('You don\'t have enough food! The bandit attacks!', 'danger');
                    Actions.genericFight(14, 'Combat Training')(game);
                }
            })),
            new EncounterOption('🗣️ Persuade them', Actions.skillCheck(13, 'Charisma', {
                'GS': (game) => {
                    game.state.player.addLuck(1);
                    game.state.addLog('You convinced the bandit to join a better path. They gave you a token of thanks!', 'success');
                },
                'MS': (game) => {
                    game.state.addLog('The bandit lets you go, but keeps your supplies.', 'warning');
                },
                'BS': (game) => {
                    game.state.addLog('Your words angered the bandit!', 'danger');
                    Actions.genericFight(14, 'Combat Training')(game);
                }
            }))
        ]
    ),
    
    new Encounter(
        'healing_spring',
        'You discover a crystal-clear spring with mystical properties.',
        [
            new EncounterOption('💧 Drink from the spring', Actions.direct((game) => {
                game.state.player.healWounds(2);
                game.state.addLog('The spring heals 2 wounds!', 'success');
            })),
            new EncounterOption('🍼 Fill your waterskin', Actions.direct((game) => {
                game.state.player.addToInventory('Healing Water');
                game.state.addLog('You fill a container with healing water.', 'success');
            })),
            new EncounterOption('🚶 Move on', Actions.direct((game) => {
                game.state.addLog('You continue your journey.', 'info');
            }))
        ]
    ),
    
    new Encounter(
        'mysterious_stranger',
        'A hooded figure approaches you. "I sense potential in you, traveler."',
        [
            new EncounterOption('📚 Learn a skill', Actions.direct((game) => {
                const availableSkills = SKILLS.filter(s => !game.state.player.hasSkill(s));
                if (availableSkills.length > 0 && game.state.player.skills.length < 6) {
                    const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                    game.state.player.addSkill(randomSkill);
                    game.state.addLog(`You learned ${randomSkill}!`, 'success');
                } else {
                    game.state.addLog('You already know too many skills.', 'warning');
                }
            })),
            new EncounterOption('✨ Receive luck', Actions.direct((game) => {
                game.state.player.addLuck(2);
                game.state.addLog('The stranger blessed you with 2 luck!', 'success');
            })),
            new EncounterOption('❌ Refuse', Actions.direct((game) => {
                game.state.addLog('You politely decline and move on.', 'info');
            }))
        ]
    )
];

