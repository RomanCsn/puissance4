export default function History() {
    // Tableau de parties qui aura pour chaque cellule une partie.
    // une partie sera ensuite un tableau avec la date, le nom du joueur 1, le nom du joueur 2 et le vainqueur (1 ou 2)
    const exampleGames: Array<[string, string, string, string]> = [
        ["2024-06-01", "Alice", "Bob", "Alice"],
        ["2024-06-02", "Charlie", "David", "David"],
        ["2024-06-03", "Eve", "Frank", "Eve"],
    ];

    return (
        <main style={{ padding: "2rem", textAlign: "center" }}>
            {/* Bouton fixe en haut à droite de l'écran */}
            <a
                href="/"
                aria-label="Nouvelle partie"
                style={{
                    position: "fixed",
                    top: "1rem",
                    right: "1rem",
                    background: "#111827",
                    color: "#ffffff",
                    padding: "0.5rem 0.9rem",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 14,
                    zIndex: 1000,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                }}
            >
                Nouvelle partie
            </a>

            {/* Header */}
            <h1 style={{ margin: 0 }}>Historique</h1>
            <p>Page d'historique des parties jouées.</p>

            {/* Liste des parties */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "1rem",
                    marginTop: "1rem",
                    justifyItems: "center",
                }}
            >
                {exampleGames.map(([date, player1, player2, winner], index) => (
                    <div
                        key={index}
                        style={{
                            width: "100%",
                            maxWidth: 560,
                            background: "#ffffff",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                            borderRadius: 12,
                            padding: "1rem 1.25rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "1rem",
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                position: "relative", // nécessaire pour centrer le VS en absolute
                            }}
                        >
                            {/* Date centrée au-dessus */}
                            <div style={{ fontSize: 12, color: "#6b7280" }}>{date}</div>

                            {/* Zone des joueurs : left/right avec VS centré */}
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                }}
                            >
                                {/* Conteneur des noms (occupe l'espace horizontal) */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        maxWidth: 360,
                                        gap: 24,
                                    }}
                                >
                                    {/* Joueur gauche : nom puis couronne si gagnant */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            justifyContent: "flex-end",
                                            minWidth: 0,
                                            flex: 1,
                                        }}
                                    >
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#111827",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        title={player1}
                    >
                      {player1}
                    </span>
                                        {winner === player1 ? (
                                            <span style={{ fontSize: 18 }}>👑</span>
                                        ) : null}
                                    </div>

                                    {/* Joueur droit : couronne avant le nom si gagnant, puis nom */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            justifyContent: "flex-start",
                                            minWidth: 0,
                                            flex: 1,
                                        }}
                                    >
                                        {winner === player2 ? (
                                            <span style={{ fontSize: 18 }}>👑</span>
                                        ) : null}
                                        <span
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 600,
                                                color: "#111827",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                            title={player2}
                                        >
                      {player2}
                    </span>
                                    </div>
                                </div>

                                {/* VS : element absolu centré pour rester exactement au milieu */}
                                <div
                                    style={{
                                        position: "absolute",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "#9ca3af",
                                        pointerEvents: "none",
                                    }}
                                    aria-hidden="true"
                                >
                                    VS
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
