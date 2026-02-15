const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"])

function stripPort(host: string): string {
  return host.split(":")[0].toLowerCase()
}

export function normalizeRequestHost(hostHeader: string | null | undefined): string | null {
  if (!hostHeader) {
    return null
  }

  const host = stripPort(hostHeader.trim())
  return host.length > 0 ? host : null
}

export function deriveTenantLookupDomain(host: string, rootDomain = process.env.ROOT_DOMAIN): string {
  if (LOCAL_HOSTS.has(host) || host.endsWith(".localhost")) {
    const parts = host.split(".")
    if (parts.length > 1 && parts[parts.length - 1] === "localhost") {
      return `${parts[0]}.localhost`
    }
    return "localhost"
  }

  if (rootDomain && host.endsWith(`.${rootDomain}`)) {
    const subdomain = host.slice(0, -1 * (`.${rootDomain}`).length)
    if (subdomain && subdomain !== "www") {
      return `${subdomain}.${rootDomain}`
    }
    return rootDomain
  }

  return host
}
