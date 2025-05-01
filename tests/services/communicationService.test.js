// __tests__/services/communicationService.test.js
import { communicationService } from "../../lib/services/communicationService";
import { apiRequest } from "../../api/client";

// Mock the apiRequest function
jest.mock("../../api/client", () => ({
  apiRequest: jest.fn(),
}));

describe("Communication Service", () => {
  beforeEach(() => {
    apiRequest.mockClear();
  });

  // --- Forums --- //
  test("getForums calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await communicationService.getForums({ page: 1 });
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/community/forums",
      null,
      expect.objectContaining({ params: { page: 1 } })
    );
  });

  test("getForumById calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "f1" } });
    await communicationService.getForumById("f1");
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/community/forums/f1",
      null,
      expect.any(Object)
    );
  });

  // --- Threads --- //
  test("getThreads calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await communicationService.getThreads({ forum_id: "f1" });
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/community/threads",
      null,
      expect.objectContaining({ params: { forum_id: "f1" } })
    );
  });

  test("getThreadById calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "t1" } });
    await communicationService.getThreadById("t1");
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/community/threads/t1",
      null,
      expect.any(Object)
    );
  });

  test("createThread calls the correct endpoint with data", async () => {
    const threadData = { title: "New Thread", forum_id: "f1" };
    apiRequest.mockResolvedValueOnce({ data: { id: "newT1" } });
    await communicationService.createThread(threadData);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/communication/community/threads",
      threadData,
      expect.any(Object)
    );
  });

  // --- Posts --- //
  test("getPosts calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await communicationService.getPosts("t1", { page: 2 });
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/community/threads/t1/posts",
      null,
      expect.objectContaining({ params: { page: 2 } })
    );
  });

  test("createPost calls the correct endpoint with data", async () => {
    const postData = { content: "My reply" };
    apiRequest.mockResolvedValueOnce({ data: { id: "newP1" } });
    await communicationService.createPost("t1", postData);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/communication/community/threads/t1/posts",
      postData,
      expect.any(Object)
    );
  });

  test("getPostById calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "p1" } });
    await communicationService.getPostById("p1");
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/community/posts/p1",
      null,
      expect.any(Object)
    );
  });

  test("updatePost calls the correct endpoint with data", async () => {
    const postData = { content: "Updated reply" };
    apiRequest.mockResolvedValueOnce({ data: { id: "p1" } });
    await communicationService.updatePost("p1", postData);
    expect(apiRequest).toHaveBeenCalledWith(
      "PUT",
      "/communication/community/posts/p1",
      postData,
      expect.any(Object)
    );
  });

  test("deletePost calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({});
    await communicationService.deletePost("p1");
    expect(apiRequest).toHaveBeenCalledWith(
      "DELETE",
      "/communication/community/posts/p1",
      null,
      expect.any(Object)
    );
  });

  // --- Moderation --- //
  test("getModerationQueue calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await communicationService.getModerationQueue({ status: "pending" });
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/community/moderation/queue",
      null,
      expect.objectContaining({ params: { status: "pending" } })
    );
  });

  test("approveModerationItem calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({});
    await communicationService.approveModerationItem("item1");
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/communication/community/moderation/items/item1/approve",
      null,
      expect.any(Object)
    );
  });

  test("rejectModerationItem calls the correct endpoint with data", async () => {
    const rejectionData = { reason: "Spam" };
    apiRequest.mockResolvedValueOnce({});
    await communicationService.rejectModerationItem("item1", rejectionData);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/communication/community/moderation/items/item1/reject",
      rejectionData,
      expect.any(Object)
    );
  });

  // --- Conversations --- //
  test("getConversations calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await communicationService.getConversations({ unread: true });
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/conversations",
      null,
      expect.objectContaining({ params: { unread: true } })
    );
  });

  test("getConversationById calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "c1" } });
    await communicationService.getConversationById("c1");
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/conversations/c1",
      null,
      expect.any(Object)
    );
  });

  test("createConversation calls the correct endpoint with data", async () => {
    const convoData = { participants: ["user1", "user2"] };
    apiRequest.mockResolvedValueOnce({ data: { id: "newC1" } });
    await communicationService.createConversation(convoData);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/communication/conversations",
      convoData,
      expect.any(Object)
    );
  });

  // --- Messages --- //
  test("getConversationMessages calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: [] });
    await communicationService.getConversationMessages("c1", { limit: 10 });
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/conversations/c1/messages",
      null,
      expect.objectContaining({ params: { limit: 10 } })
    );
  });

  test("sendMessageInConversation calls the correct endpoint with data", async () => {
    const messageData = { content: "Hello!" };
    apiRequest.mockResolvedValueOnce({ data: { id: "newM1" } });
    await communicationService.sendMessageInConversation("c1", messageData);
    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/communication/conversations/c1/messages",
      messageData,
      expect.any(Object)
    );
  });

  test("getMessageById calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({ data: { id: "m1" } });
    await communicationService.getMessageById("m1");
    expect(apiRequest).toHaveBeenCalledWith(
      "GET",
      "/communication/messages/m1",
      null,
      expect.any(Object)
    );
  });

  test("updateMessage calls the correct endpoint with data", async () => {
    const messageData = { content: "Updated hello!" };
    apiRequest.mockResolvedValueOnce({ data: { id: "m1" } });
    await communicationService.updateMessage("m1", messageData);
    expect(apiRequest).toHaveBeenCalledWith(
      "PUT",
      "/communication/messages/m1",
      messageData,
      expect.any(Object)
    );
  });

  test("deleteMessage calls the correct endpoint", async () => {
    apiRequest.mockResolvedValueOnce({});
    await communicationService.deleteMessage("m1");
    expect(apiRequest).toHaveBeenCalledWith(
      "DELETE",
      "/communication/messages/m1",
      null,
      expect.any(Object)
    );
  });

  // Test error handling
  test("getThreads handles API errors", async () => {
    const error = new Error("Failed to fetch threads");
    apiRequest.mockRejectedValueOnce(error);

    await expect(communicationService.getThreads()).rejects.toThrow(
      "Failed to fetch community threads"
    );
  });
});

