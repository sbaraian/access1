{
    "plugins": ["import"],
    "rules": {
        "import/order": [
            "error",
            {
                "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "object"],
                "newlines-between": "always"
            }
        ]
    }
}