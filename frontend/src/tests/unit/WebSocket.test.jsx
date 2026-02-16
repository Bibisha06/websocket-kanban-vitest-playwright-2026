import { vi, describe, it, expect, beforeEach } from "vitest";
import io from "socket.io-client";

vi.mock("socket.io-client", () => {
    const mSocket = {
        on: vi.fn(),
        emit: vi.fn(),
        close: vi.fn(),
    };
    return {
        default: vi.fn(() => mSocket),
    };
});

describe("WebSocket Logic", () => {
    let socket;

    beforeEach(() => {
        vi.clearAllMocks();
        socket = io("http://localhost:5000");
    });

    it("should initialize socket connection with correct URL", () => {
        expect(io).toHaveBeenCalledWith("http://localhost:5000");
    });

    it("should emit task:create when a new task is added", () => {
        const taskData = { title: "New Task" };
        socket.emit("task:create", taskData);
        expect(socket.emit).toHaveBeenCalledWith("task:create", taskData);
    });

    it("should emit task:update when a task is edited", () => {
        const taskData = { _id: "1", title: "Updated Task" };
        socket.emit("task:update", taskData);
        expect(socket.emit).toHaveBeenCalledWith("task:update", taskData);
    });

    it("should emit task:delete when a task is removed", () => {
        socket.emit("task:delete", "1");
        expect(socket.emit).toHaveBeenCalledWith("task:delete", "1");
    });

    it("should emit sync:request when sync is triggered", () => {
        socket.emit("sync:request");
        expect(socket.emit).toHaveBeenCalledWith("sync:request");
    });
});
