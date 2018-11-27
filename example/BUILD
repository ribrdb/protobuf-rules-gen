load("@build_bazel_rules_nodejs//:defs.bzl", "jasmine_node_test")
load("@proto_gen_firebase_rules//:bazel/defs.bzl", "firestore_rules_proto_library", "firestore_rules_binary")

firestore_rules_proto_library(
    name = "schema",
    srcs = ["schema.proto"],
)

firestore_rules_binary(
    name = "example",
    srcs = ["main.rules"],
    deps = [":schema"],
    visibility = ["//visibility:public"],
)

jasmine_node_test(
    name = "rules_test",
    srcs = ["rules_test.js"],
    data = [
        "example.rules",
        "@com_google_cloud_firestore_emulator//jar",
    ],
    node_modules = "@npm//:node_modules",
    install_source_map_support = False,
)

exports_files(["package.json", "yarn.lock", "testdata/golden.rules"])
