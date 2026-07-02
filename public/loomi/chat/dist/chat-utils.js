export const PARTICIPANT_COLORS = [
    "primary",
    "blue",
    "purple",
    "pink",
    "success",
    "warning",
    "cyan",
    "secondary",
];
export function initialsFor(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length)
        return "?";
    if (parts.length === 1)
        return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
export function colorForParticipant(id, explicit) {
    if (explicit && PARTICIPANT_COLORS.includes(explicit)) {
        return explicit;
    }
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash + id.charCodeAt(i) * (i + 1)) % PARTICIPANT_COLORS.length;
    }
    return PARTICIPANT_COLORS[hash];
}
export function bubbleVars(color) {
    const resolved = PARTICIPANT_COLORS.includes(color)
        ? color
        : colorForParticipant(String(color));
    return [
        `--loomi-chat-bubble-bg: var(--loomi-${resolved}-50, var(--_loomi-${resolved}-50-default))`,
        `--loomi-chat-bubble-border: var(--loomi-${resolved}-200, var(--_loomi-${resolved}-200-default))`,
        // The 50-scale background stays light in dark mode too, so pin the text to the
        // dark end of the same hue instead of the theme's (possibly light) text color.
        `--loomi-chat-bubble-text: var(--loomi-${resolved}-950, var(--_loomi-${resolved}-950-default))`,
    ].join("; ");
}
export function resolveParticipant(participants, senderId) {
    const found = participants.find((entry) => entry.id === senderId);
    if (found)
        return found;
    return {
        id: senderId,
        name: senderId,
        label: initialsFor(senderId),
        color: colorForParticipant(senderId),
    };
}
export function resolveSenderId(message, currentUserId) {
    if (message.senderId)
        return message.senderId;
    if (message.role === "user")
        return currentUserId;
    if (message.role === "assistant")
        return "assistant";
    return currentUserId;
}
//# sourceMappingURL=chat-utils.js.map