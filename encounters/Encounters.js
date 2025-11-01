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
                    game.distributeWounds(1, '🐻 The bear swipes at you before running away.', 'warning', () => game.nextEncounter());
                },
                'BS': (game) => {
                    game.distributeWounds(1, '🐻 The bear attacks! You must fight!', 'danger', () => {
                        Actions.genericFight(16, 'Combat Training')(game);
                    });
                }
            })),
            new EncounterOption('🏃 Run away', Actions.direct((game) => {
                game.state.addEncounterInfo('You flee from the bear and continue on your journey.', 'info', () => game.nextEncounter());
            }))
        ],
        ['forest', 'wilderness']
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
                    game.addInventoryToParty('Stolen Goods', () => {
                        game.state.addEncounterInfo('Successfully robbed the merchant! Gained food, luck, and items.', 'success', () => game.nextEncounter());
                    });
                },
                'MS': (game) => {
                    game.state.player.addFood(1);
                    game.state.addEncounterInfo('You got some food, but the merchant noticed you!', 'warning', () => game.nextEncounter());
                },
                'BS': (game) => {
                    game.distributeWounds(2, 'The merchant\'s guards caught you!', 'danger', () => game.nextEncounter());
                }
            })),
            new EncounterOption('👋 Leave peacefully', Actions.direct((game) => {
                game.state.addEncounterInfo('You wave goodbye to the merchant.', 'info', () => game.nextEncounter());
            }))
        ],
        ['road', 'plains']
    ),
    
    new Encounter(
        'locked_chest',
        'You discover an old locked chest partially buried in the ground.',
        [
            new EncounterOption('🔓 Use lockpick', Actions.direct((game) => {
                game.state.player.addLuck(2);
                game.state.player.addCoins(30);
                game.addInventoryToParty('Golden Coin', () => {
                    game.state.addEncounterInfo('📦 Used lockpick to open the chest! Found luck, coins, and treasure!', 'success', () => game.nextEncounter());
                });
            }), { type: 'item', item: 'Lockpick' }),
            new EncounterOption('🔓 Pick the lock (no tools)', Actions.skillCheck(15, 'Lockpicking', {
                'GS': (game) => {
                    game.state.player.addLuck(2);
                    game.state.player.addCoins(30);
                    game.addInventoryToParty('Golden Coin', () => {
                        game.state.addEncounterInfo('Successfully picked the lock! Found luck, coins, and treasure!', 'success', () => game.nextEncounter());
                    });
                },
                'MS': (game) => {
                    game.state.player.addLuck(1);
                    game.state.addEncounterInfo('You managed to open it, but it took a while.', 'warning', () => game.nextEncounter());
                },
                'BS': (game) => {
                    game.distributeWounds(1, 'The chest was trapped! It exploded.', 'danger', () => game.nextEncounter());
                }
            })),
            new EncounterOption('💪 Smash it open', Actions.direct((game) => {
                const outcome = Math.random();
                if (outcome > 0.5) {
                    game.addInventoryToParty('Broken Treasure', () => {
                        game.state.addEncounterInfo('You smashed it open and found some broken items.', 'warning', () => game.nextEncounter());
                    });
                } else {
                    game.distributeWounds(1, 'The chest was too sturdy. You hurt yourself.', 'danger', () => game.nextEncounter());
                }
            })),
            new EncounterOption('🚶 Leave it', Actions.direct((game) => {
                game.state.addEncounterInfo('You decide not to risk it and continue on.', 'info', () => game.nextEncounter());
            }))
        ],
        ['wilderness', 'ruins']
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
        ],
        ['road', 'forest']
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
                game.addInventoryToParty('Healing Water', () => {
                    game.state.addEncounterInfo('You fill a container with healing water.', 'success', () => game.nextEncounter());
                });
            })),
            new EncounterOption('🚶 Move on', Actions.direct((game) => {
                game.state.addEncounterInfo('You continue your journey.', 'info', () => game.nextEncounter());
            }))
        ],
        ['wilderness', 'forest']
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
        ],
        ['road', 'city']
    ),

    // ==================== DUNGEON ENCOUNTERS ====================

    new Encounter(
        'dungeon_skeleton',
        'A skeleton warrior rises from the dusty floor, bones rattling as it reaches for a rusty sword.',
        [
            new EncounterOption('⚔️ Fight the skeleton', Actions.genericFight(12, 'Combat Training')),
            new EncounterOption('🏃 Flee deeper into the dungeon', Actions.direct((game) => {
                game.state.addEncounterInfo('You run past the skeleton into the darkness.', 'info', () => game.nextEncounter());
            }))
        ],
        ['dungeon']
    ),

    new Encounter(
        'dungeon_trap',
        'You notice pressure plates on the floor ahead. The corridor is narrow.',
        [
            new EncounterOption('🎯 Carefully disarm the trap', Actions.skillCheck(13, 'Lockpicking', {
                'GS': (game) => {
                    game.state.player.addCoins(20);
                    game.state.addEncounterInfo('You disarmed the trap and found coins in a hidden compartment!', 'success', () => game.nextEncounter());
                },
                'MS': (game) => {
                    game.state.addEncounterInfo('You disarmed the trap, but it took a while.', 'warning', () => game.nextEncounter());
                },
                'BS': (game) => {
                    game.distributeWounds(2, 'The trap triggered! Arrows fly from the walls!', 'danger', () => game.nextEncounter());
                }
            })),
            new EncounterOption('🏃 Sprint across', Actions.direct((game) => {
                const outcome = Math.random();
                if (outcome > 0.4) {
                    game.state.addEncounterInfo('You made it across safely!', 'success', () => game.nextEncounter());
                } else {
                    game.distributeWounds(1, 'A dart hit you as you ran!', 'danger', () => game.nextEncounter());
                }
            }))
        ],
        ['dungeon']
    ),

    new Encounter(
        'dungeon_altar',
        'An ancient altar stands in the center of the room, covered in strange runes that glow faintly.',
        [
            new EncounterOption('🙏 Pray at the altar', Actions.direct((game) => {
                const outcome = Math.random();
                if (outcome > 0.5) {
                    game.state.player.addLuck(1);
                    game.state.addEncounterInfo('The altar glows brightly and you feel blessed!', 'success', () => game.nextEncounter());
                } else {
                    game.distributeWounds(1, 'Dark energy surges from the altar!', 'danger', () => game.nextEncounter());
                }
            })),
            new EncounterOption('🚶 Leave it alone', Actions.direct((game) => {
                game.state.addEncounterInfo('You wisely avoid the mysterious altar.', 'info', () => game.nextEncounter());
            }))
        ],
        ['dungeon']
    ),

    new Encounter(
        'dungeon_rats',
        'A swarm of giant rats blocks your path, their red eyes gleaming in the torchlight.',
        [
            new EncounterOption('⚔️ Fight the rats', Actions.genericFight(10, 'Combat Training')),
            new EncounterOption('🍞 Throw food to distract them', Actions.direct((game) => {
                game.state.addEncounterInfo('🍞 The rats devour the food, allowing you to pass safely.', 'success', () => game.nextEncounter());
            }), { type: 'food', amount: 1 })
        ],
        ['dungeon']
    ),

    new Encounter(
        'dungeon_treasure',
        'You find a small treasure chest sitting on a pedestal in an alcove.',
        [
            new EncounterOption('📦 Open the chest', Actions.direct((game) => {
                game.state.player.addCoins(25);
                game.addInventoryToParty('Ancient Relic', () => {
                    game.state.addEncounterInfo('You found coins and an ancient relic!', 'success', () => game.nextEncounter());
                });
            })),
            new EncounterOption('🚶 Ignore it (might be trapped)', Actions.direct((game) => {
                game.state.addEncounterInfo('You cautiously move on without touching the chest.', 'info', () => game.nextEncounter());
            }))
        ],
        ['dungeon']
    ),

    new Encounter(
        'dungeon_ghost',
        'A translucent figure materializes before you, moaning in an ancient language.',
        [
            new EncounterOption('⚔️ Attack the ghost', Actions.genericFight(15, 'Combat Training')),
            new EncounterOption('🕯️ Offer a prayer', Actions.skillCheck(22, 'Charisma', {
                'GS': (game) => {
                    game.state.player.addLuck(2);
                    game.state.addEncounterInfo('The ghost fades peacefully, leaving behind a blessing.', 'success', () => game.nextEncounter());
                },
                'MS': (game) => {
                    game.state.addEncounterInfo('The ghost seems calmer and drifts away.', 'warning', () => game.nextEncounter());
                },
                'BS': (game) => {
                    game.distributeWounds(1, 'The ghost shrieks and lashes out!', 'danger', () => game.nextEncounter());
                }
            }))
        ],
        ['dungeon']
    ),

    // ==================== CITY ENCOUNTER ====================

    new Encounter(
        'city',
        'You arrive at a bustling city. The streets are filled with merchants, travelers, and the smell of fresh bread. What would you like to do?',
        [
            new EncounterOption('🏨 Rest at the inn', Actions.direct((game) => {
                const healCost = 10;
                const woundsToHeal = game.state.player.wounds;

                if (woundsToHeal === 0) {
                    game.state.addEncounterInfo('You are already at full health!', 'info', () => {
                        const cityEncounter = ENCOUNTERS.find(e => e.id === 'city');
                        game.loadEncounter(cityEncounter);
                    });
                } else {
                    const totalCost = woundsToHeal * healCost;
                    if (game.state.player.coins >= totalCost) {
                        game.state.player.removeCoins(totalCost);
                        game.state.player.healWounds(woundsToHeal);
                        game.state.addEncounterInfo(`💚 You rest at the inn and heal ${woundsToHeal} wound${woundsToHeal > 1 ? 's' : ''} for ${totalCost} coins. You feel refreshed!`, 'success', () => {
                            const cityEncounter = ENCOUNTERS.find(e => e.id === 'city');
                            game.loadEncounter(cityEncounter);
                        });
                    } else {
                        game.state.addEncounterInfo(`You need ${totalCost} coins to heal all your wounds, but you only have ${game.state.player.coins} coins.`, 'warning', () => {
                            const cityEncounter = ENCOUNTERS.find(e => e.id === 'city');
                            game.loadEncounter(cityEncounter);
                        });
                    }
                }
            })),

            new EncounterOption('🛒 Visit the shop', Actions.direct((game) => {
                // Generate shop inventory if not already generated for this city
                if (!game.state.cityShopInventory) {
                    game.generateCityShopInventory();
                }

                // Open the shop modal with callback to return to city
                game.openShop(() => {
                    // When shop closes, reload the city encounter
                    const cityEncounter = ENCOUNTERS.find(e => e.id === 'city');
                    game.loadEncounter(cityEncounter);
                });
            })),

            new EncounterOption('🍺 Visit the tavern', Actions.direct((game) => {
                game.state.addEncounterInfo('🍺 You enter the tavern. It\'s lively with music and chatter.', 'info', () => {
                    // Create a sub-encounter for the tavern
                    const tavernEncounter = new Encounter(
                        'city_tavern',
                        'The tavern is warm and inviting. What would you like to do?',
                        [
                            new EncounterOption('👥 Hire a companion (50 coins)', Actions.direct((g) => {
                                const availableCompanions = [
                                    { name: 'Warrior', wounds: 4, maxWounds: 4, skills: ['Combat Training'] },
                                    { name: 'Rogue', wounds: 3, maxWounds: 3, skills: ['Lockpicking', 'Pickpocketing'] },
                                    { name: 'Ranger', wounds: 3, maxWounds: 3, skills: ['Survival', 'Animal Handling'] },
                                    { name: 'Bard', wounds: 2, maxWounds: 2, skills: ['Charisma', 'Performance'] }
                                ];

                                const randomCompanion = availableCompanions[Math.floor(Math.random() * availableCompanions.length)];
                                const companion = new Character(randomCompanion.name, randomCompanion.wounds, randomCompanion.maxWounds, 6);
                                randomCompanion.skills.forEach(skill => companion.addSkill(skill));

                                g.state.addCompanion(companion);
                                g.state.addEncounterInfo(`👥 ${randomCompanion.name} joins your party!`, 'success', () => {
                                    const cityEncounter = ENCOUNTERS.find(e => e.id === 'city');
                                    g.loadEncounter(cityEncounter);
                                });
                            }), { type: 'coins', amount: 50 }),

                            new EncounterOption('🍻 Get drunk (5 coins)', Actions.direct((g) => {
                                const outcome = Math.random();
                                if (outcome > 0.6) {
                                    g.state.player.addLuck(1);
                                    g.state.addEncounterInfo('🍻 You had a great time! You feel lucky! (+1 luck)', 'success', () => {
                                        const cityEncounter = ENCOUNTERS.find(e => e.id === 'city');
                                        g.loadEncounter(cityEncounter);
                                    });
                                } else if (outcome > 0.3) {
                                    g.state.addEncounterInfo('🍻 You had a good time, but nothing special happened.', 'info', () => {
                                        const cityEncounter = ENCOUNTERS.find(e => e.id === 'city');
                                        g.loadEncounter(cityEncounter);
                                    });
                                } else {
                                    g.distributeWounds(1, '🍻 You got into a bar fight and took a wound!', 'danger', () => {
                                        const cityEncounter = ENCOUNTERS.find(e => e.id === 'city');
                                        g.loadEncounter(cityEncounter);
                                    });
                                }
                            }), { type: 'coins', amount: 5 }),

                            new EncounterOption('🚪 Leave the tavern', Actions.direct((g) => {
                                g.state.addEncounterInfo('You leave the tavern.', 'info', () => {
                                    const cityEncounter = ENCOUNTERS.find(e => e.id === 'city');
                                    g.loadEncounter(cityEncounter);
                                });
                            }))
                        ],
                        ['city']
                    );
                    game.loadEncounter(tavernEncounter);
                });
            })),

            new EncounterOption('🚶 Leave the city', Actions.direct((game) => {
                // Clear the city shop inventory so next city has different items
                game.state.cityShopInventory = null;
                game.state.addEncounterInfo('🚶 You leave the city and continue your journey.', 'info', () => game.nextEncounter());
            }))
        ],
        ['city']
    )
];

