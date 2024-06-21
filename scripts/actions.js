import { MODULE_ID } from "./const.js";

function getMaxActions(actor) {
    return (actor.traits?.has("minion") ? 2 : 3) + (actor.hasCondition("quickened") ? 1 : 0);
}

export function getActionCount(token) {
    // Get the token's actor
    let actor = token.actor;

    // Check to see if the actor is immobilized, paralyzed, petrified, or unconsciou. If so they have 0 actions.
    if (actor.hasCondition("immobilized", "paralyzed", "petrified", "unconscious")) {
        return 0;
    }

    // Get the actor's maximum number of actions
    let maxActions = getMaxActions(actor);

    // Check to see if limit actions is disabled
    if (!game.settings.get(MODULE_ID, "limitActions")) {
        return maxActions;
    }

    // Check to see if the token is in combat and if that combat has started
    if (!token.document.inCombat && !game.combat?.started) {
        return maxActions;
    }

    // Check to see if the actor is stunned or slowed, and if so the value
    let stunned = actor.getCondition("stunned")?.value ?? 0;
    let slowed = actor.getCondition("slowed")?.value ?? 0;

    // This is for PF2e Workbench, used to store how much stun is auto reduced by
    let reduction = 0;

    // Check to see if PF2e Workbench is active and if Auto Reduce Stunned is enabled
    if (game.modules.get("xdy-pf2e-workbench")?.active && game.settings.get("xdy-pf2e-workbench", "autoReduceStunned")) {
        // Get Stun Reduction
        let stunReduction = actor.getFlag("xdy-pf2e-workbench", "stunReduction");
        // Make sure we actually got something
        if (!(stunReduction == null)) {
            // Check to see if the combat is the same
            if (stunReduction.combat == game.combat.id) {
                // Get the token's combatant
                let combatant = game.combat.turns.find(x => x.tokenId == token.id);

                // We are going to check to see if the combatant's last round matches the stun reduction round
                // Note - A combatant's last round is updated at the start of their turn
                if (combatant.roundOfLastTurn == stunReduction.round) {
                    reduction = stunReduction.reducedBy;
                }
            }
        }
    }

    // Return the token's maximum number of actions minus the greater of their stunned, slowed, or stun reduction.
    // If it's below 0 we will return 0
    return Math.max(maxActions - Math.max(stunned, slowed, reduction), 0);
}