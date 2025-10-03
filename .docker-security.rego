#
# Run with:
#
# $ conftest test -p .docker-security.rego Dockerfile
#
package main

# Do Not store secrets in ENV variables
secrets_env = [
    "passwd",
    "password",
    "pass",
    "secret",
    "key",
    "access",
    "api_key",
    "apikey",
    "token",
    "tkn"
]

trusted_images = [
    "docker.io/library/nginx",
    "docker.io/library/node",
    # multistage image names.
    "base",
    "nginx",
    "node",
]

deny[msg] {
    input[i].Cmd == "env"
    val := input[i].Value
    contains(lower(val[_]), secrets_env[_])
    msg = sprintf("Line %d: Potential secret in ENV key found: %s", [i, val])
}

# Do not use 'latest' tag for base images
deny[msg] {
    input[i].Cmd == "from"
    val := split(input[i].Value[0], ":")
    contains(lower(val[1]), "latest")
    msg = sprintf("Line %d: do not use 'latest' tag for base images", [i])
}

# Avoid curl bashing
deny_curl_bashing[msg] {
    input[i].Cmd == "run"
    val := concat(" ", input[i].Value)
    matches := regex.find_n("(curl|wget)[^|^>]*[|>]", lower(val), -1)
    count(matches) > 0
    msg = sprintf("Line %d: Avoid curl bashing", [i])
}

# Do not upgrade your system packages
upgrade_commands = [
    "apk upgrade",
    "apt-get upgrade",
    "dist-upgrade",
]

deny[msg] {
    input[i].Cmd == "run"
    val := concat(" ", input[i].Value)
    contains(val, upgrade_commands[_])
    msg = sprintf("Line: %d: Do not upgrade your system packages", [i])
}

# Do not use ADD if possible
deny[msg] {
    input[i].Cmd == "add"
    msg = sprintf("Line %d: Use COPY instead of ADD", [i])
}

# Do not root
any_user {
    input[i].Cmd == "user"
 }

deny_root_user[msg] {
    not any_user
    msg = "Do not run as root, use USER instead"
}

# Do not sudo
deny[msg] {
    input[i].Cmd == "run"
    val := concat(" ", input[i].Value)
    contains(lower(val), "sudo")
    msg = sprintf("Line %d: Do not use 'sudo' command", [i])
}

# Forbid the use of images not in the trusted list
deny[msg] {
    input[i].Cmd == "from"
    image_name := input[i].Value[0]
    not is_trusted(image_name)
    msg = sprintf("Line %d: Image '%s' is not in the list of trusted images. Please use one of the approved base images.", [i, image_name])
}

is_trusted(image_name) {
	startswith(image_name, trusted_images[_])
}

# Use multi-stage builds
default multi_stage = false
multi_stage = true {
    input[i].Cmd == "copy"
    val := concat(" ", input[i].Flags)
    contains(lower(val), "--from=")
}
deny[msg] {
    multi_stage == false
    msg = sprintf("You COPY, but do not appear to use multi-stage builds...", [])
}
