workspace(name = "proto_gen_firebase_rules")

load(":bazel/repositories.bzl", "protobuf_rules_gen_repositories")

protobuf_rules_gen_repositories()


# Load nodejs for //example:rules_test
RULES_NODEJS_COMMIT = "62d309aed7769ddbb6709b0d8109d0f4718fb635"
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "2e102d7c6c5bcb8cda663b3d2e834b68e5c041faeae2e49fe3029610c9ac66eb",
    strip_prefix = "rules_nodejs-"+RULES_NODEJS_COMMIT,
    url = ("http://github.com/bazelbuild/rules_nodejs/archive/%s.tar.gz"%RULES_NODEJS_COMMIT),
)
load("@build_bazel_rules_nodejs//:package.bzl", "rules_nodejs_dependencies")

rules_nodejs_dependencies()

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories", "yarn_install")

node_repositories(package_json = ["//example:package.json"])

yarn_install(
    name = "npm",
    package_json = "//example:package.json",
    yarn_lock = "//example:yarn.lock",
)