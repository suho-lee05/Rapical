function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";
  const rawMessage = String(err?.message || "Internal Server Error");

  const looksLikeHtml =
    rawMessage.includes("<!DOCTYPE html") ||
    rawMessage.includes("<html") ||
    rawMessage.includes("Cloudflare") ||
    rawMessage.includes("Bad gateway");

  const isUpstreamGatewayIssue =
    looksLikeHtml ||
    rawMessage.toLowerCase().includes("bad gateway") ||
    rawMessage.toLowerCase().includes("502");

  if (isUpstreamGatewayIssue) {
    statusCode = 502;
  }

  const safeMessage = isUpstreamGatewayIssue
    ? "Supabase 서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해 주세요."
    : rawMessage;

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(isProd ? {} : { stack: err.stack }),
  });
}

module.exports = errorHandler;
