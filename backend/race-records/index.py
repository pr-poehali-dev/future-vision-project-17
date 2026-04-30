import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение и сохранение рекордов гонки."""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    if event.get("httpMethod") == "GET":
        cur.execute(
            "SELECT player_name, finish_time_ms, created_at FROM race_records ORDER BY finish_time_ms ASC LIMIT 10"
        )
        rows = cur.fetchall()
        records = [
            {"player_name": r[0], "finish_time_ms": r[1], "created_at": r[2].isoformat()}
            for r in rows
        ]
        conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"records": records})}

    if event.get("httpMethod") == "POST":
        body = json.loads(event.get("body") or "{}")
        name = str(body.get("player_name", "Игрок"))[:32].strip() or "Игрок"
        time_ms = int(body.get("finish_time_ms", 0))
        laps = int(body.get("laps", 3))

        if time_ms <= 0:
            conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Invalid time"})}

        cur.execute(
            "INSERT INTO race_records (player_name, finish_time_ms, laps) VALUES (%s, %s, %s)",
            (name, time_ms, laps),
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 405, "headers": headers, "body": json.dumps({"error": "Method not allowed"})}
