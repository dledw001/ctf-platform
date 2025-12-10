exports.up = pgm => {
    pgm.createTable("users", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        email: {
            type: "text",
            notNull: true,
            unique: true,
        },
        password_hash: {
            type: "text",
            notNull: true,
        },
        is_admin: {
            type: "boolean",
            notNull: true,
            default: false,
        },
        score: {
            type: "integer",
            notNull: true,
            default: 0,
        },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("NOW()"),
        },
        updated_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("NOW()"),
        },
    });

    pgm.createTable("challenges", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        title: {
            type: "text",
            notNull: true,
        },
        description: {
            type: "text",
            notNull: true,
        },
        flag_hash: {
            type: "text",
            notNull: true,
        },
        difficulty: {
            type: "text",
            notNull: true,
        },
        points: {
            type: "integer",
            notNull: true,
        },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("NOW()"),
        },
        updated_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("NOW()"),
        },
    });

    pgm.addConstraint(
        "challenges",
        "chk_challenge_points_positive",
        "CHECK (points > 0)"
    );

    pgm.addConstraint(
        "challenges",
        "chk_challenge_difficulty_valid",
        "CHECK (difficulty IN ('easy', 'medium', 'hard'))"
    );

    pgm.createTable("submissions", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        user_id: {
            type: "bigint",
            notNull: true,
            references: '"users"',
            onDelete: "CASCADE",
        },
        challenge_id: {
            type: "bigint",
            notNull: true,
            references: '"challenges"',
            onDelete: "CASCADE",
        },
        submitted_flag_hash: {
            type: "text",
            notNull: true,
        },
        is_correct: {
            type: "boolean",
            notNull: true,
        },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("NOW()"),
        },
        updated_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("NOW()"),
        },
    });

    pgm.createIndex("submissions", "user_id", {name: "idx_submissions_user"});
    pgm.createIndex("submissions", "challenge_id", {name: "idx_submissions_challenge"});
    pgm.createIndex("submissions", ["user_id", "challenge_id"], {
        name: "unique_correct_submission",
        unique: true,
        where: "is_correct = TRUE"
    });
};

exports.down = pgm => {
    pgm.dropTable("submissions");
    pgm.dropTable("challenges");
    pgm.dropTable("users");
};
