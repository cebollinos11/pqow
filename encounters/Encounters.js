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
                    game.state.addEncounterInfo('🐻 The bear nuzzles you gently and joins your party!', 'success', () => game.nextEncounter());
                },
                'MS': (game) => {
                    game.distributeWounds(1, () => {
                        game.state.addEncounterInfo('🐻 The bear swipes at you before running away.', 'warning', () => game.nextEncounter());
                    });
                },
                'BS': (game) => {
                    game.distributeWounds(1, () => {
                        game.state.addEncounterInfo('🐻 The bear attacks! You must fight!', 'danger', () => {
                            Actions.genericFight(16, 'Combat Training')(game);
                        });
                    });
                }
            })),
            new EncounterOption('🏃 Run away', Actions.direct((game) => {
                game.state.addEncounterInfo('You flee from the bear and continue on your journey.', 'info', () => game.nextEncounter());
            }))
        ]
    ),
    
    new Encounter(
        'merchant',
        'A traveling merchant approaches you with a friendly smile. "Looking to trade?"',
        [
            new EncounterOption('🍞 Buy food', Actions.direct((game) => {
                game.state.player.addFood(3);
                game.state.addEncounterInfo('💰 Purchased 3 food for 10 coins.', 'success', () => game.nextEncounter());
            }), { type: 'coins', amount: 10 }),
            new EncounterOption('🍀 Buy luck point', Actions.direct((game) => {
                game.state.player.addLuck(1);
                game.state.addEncounterInfo('💰 Purchased 1 luck point for 20 coins.', 'success', () => game.nextEncounter());
            }), { type: 'coins', amount: 20 }),
            new EncounterOption('🗡️ Rob the merchant', Actions.skillCheck(15, 'Pickpocketing', {
                'GS': (game) => {
                    game.state.player.addFood(2);
                    game.state.player.addLuck(1);
                    game.state.player.addToInventory('Stolen Goods');
                    game.state.addEncounterInfo('Successfully robbed the merchant! Gained food, luck, and items.', 'success', () => game.nextEncounter());
                },
                'MS': (game) => {
                    game.state.player.addFood(1);
                    game.state.addEncounterInfo('You got some food, but the merchant noticed you!', 'warning', () => game.nextEncounter());
                },
                'BS': (game) => {
                    game.distributeWounds(2, () => {
                        game.state.addEncounterInfo('The merchant\'s guards caught you!', 'danger', () => game.nextEncounter());
                    });
                }
            })),
            new EncounterOption('👋 Leave peacefully', Actions.direct((game) => {
                game.state.addEncounterInfo('You wave goodbye to the merchant.', 'info', () => game.nextEncounter());
            }))
        ]
    ),
    
    new Encounter(
        'locked_chest',
        'You discover an old locked chest partially buried in the ground.',
        [
            new EncounterOption('🔓 Use lockpick', Actions.direct((game) => {
                game.state.player.addLuck(2);
                game.state.player.addCoins(30);
                game.state.player.addToInventory('Golden Coin');
                game.state.addEncounterInfo('📦 Used lockpick to open the chest! Found luck, coins, and treasure!', 'success', () => game.nextEncounter());
            }), { type: 'item', item: 'Lockpick' }),
            new EncounterOption('🔓 Pick the lock (no tools)', Actions.skillCheck(15, 'Lockpicking', {
                'GS': (game) => {
                    game.state.player.addLuck(2);
                    game.state.player.addCoins(30);
                    game.state.player.addToInventory('Golden Coin');
                    game.state.addEncounterInfo('Successfully picked the lock! Found luck, coins, and treasure!', 'success', () => game.nextEncounter());
                },
                'MS': (game) => {
                    game.state.player.addLuck(1);
                    game.state.addEncounterInfo('You managed to open it, but it took a while.', 'warning', () => game.nextEncounter());
                },
                'BS': (game) => {
                    game.distributeWounds(1, () => {
                        game.state.addEncounterInfo('The chest was trapped! It exploded.', 'danger', () => game.nextEncounter());
                    });
                }
            })),
            new EncounterOption('💪 Smash it open', Actions.direct((game) => {
                const outcome = Math.random();
                if (outcome > 0.5) {
                    game.state.player.addToInventory('Broken Treasure');
                    game.state.addEncounterInfo('You smashed it open and found some broken items.', 'warning', () => game.nextEncounter());
                } else {
                    game.distributeWounds(1, () => {
                        game.state.addEncounterInfo('The chest was too sturdy. You hurt yourself.', 'danger', () => game.nextEncounter());
                    });
                }
            })),
            new EncounterOption('🚶 Leave it', Actions.direct((game) => {
                game.state.addEncounterInfo('You decide not to risk it and continue on.', 'info', () => game.nextEncounter());
            }))
        ]
    ),
    
    new Encounter(
        'bandit',
        'A bandit jumps out from behind a tree! "Your gold or your life!"',
        [
            new EncounterOption('⚔️ Fight!', Actions.genericFight(14, 'Combat Training')),
            new EncounterOption('💰 Bribe with coins', Actions.direct((game) => {
                game.state.addEncounterInfo('💰 You gave the bandit 15 coins and they let you pass.', 'warning', () => game.nextEncounter());
            }), { type: 'coins', amount: 15 }),
            new EncounterOption('🍞 Bribe with food', Actions.direct((game) => {
                game.state.addEncounterInfo('🍞 You gave the bandit 2 food and they let you pass.', 'warning', () => game.nextEncounter());
            }), { type: 'food', amount: 2 }),
            new EncounterOption('🗣️ Persuade them', Actions.skillCheck(13, 'Charisma', {
                'GS': (game) => {
                    game.state.player.addLuck(1);
                    game.state.addEncounterInfo('You convinced the bandit to join a better path. They gave you a token of thanks!', 'success', () => game.nextEncounter());
                },
                'MS': (game) => {
                    game.state.addEncounterInfo('The bandit lets you go, but keeps your supplies.', 'warning', () => game.nextEncounter());
                },
                'BS': (game) => {
                    game.state.addEncounterInfo('Your words angered the bandit!', 'danger', () => {
                        Actions.genericFight(14, 'Combat Training')(game);
                    });
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
                game.state.addEncounterInfo('The spring heals 2 wounds!', 'success', () => game.nextEncounter());
            })),
            new EncounterOption('🍼 Fill your waterskin', Actions.direct((game) => {
                game.state.player.addToInventory('Healing Water');
                game.state.addEncounterInfo('You fill a container with healing water.', 'success', () => game.nextEncounter());
            })),
            new EncounterOption('🚶 Move on', Actions.direct((game) => {
                game.state.addEncounterInfo('You continue your journey.', 'info', () => game.nextEncounter());
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
                    game.state.addEncounterInfo(`You learned ${randomSkill}!`, 'success', () => game.nextEncounter());
                } else {
                    game.state.addEncounterInfo('You already know too many skills.', 'warning', () => game.nextEncounter());
                }
            })),
            new EncounterOption('✨ Receive luck', Actions.direct((game) => {
                game.state.player.addLuck(2);
                game.state.addEncounterInfo('The stranger blessed you with 2 luck!', 'success', () => game.nextEncounter());
            })),
            new EncounterOption('❌ Refuse', Actions.direct((game) => {
                game.state.addEncounterInfo('You politely decline and move on.', 'info', () => game.nextEncounter());
            }))
        ]
    )
];

