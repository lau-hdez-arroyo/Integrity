using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace INTEGRITY.API.Services
{
    /// <summary>
    /// Supabase REST API Client
    /// Uses API Key authentication instead of direct database connection
    /// </summary>
    public interface ISupabaseClient
    {
        Task<T> GetAsync<T>(string endpoint, string query = "");
        Task<T> PostAsync<T>(string endpoint, object data);
        Task<T> PutAsync<T>(string endpoint, string id, object data);
        Task DeleteAsync(string endpoint, string id);
    }

    public class SupabaseClient : ISupabaseClient
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public SupabaseClient(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            
            // Configure headers
            var apiKey = configuration["Supabase:PublishableKey"];
            _httpClient.DefaultRequestHeaders.Add("apikey", apiKey);
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        }

        public async Task<T> GetAsync<T>(string endpoint, string query = "")
        {
            try
            {
                var url = $"{endpoint}{query}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                return System.Text.Json.JsonSerializer.Deserialize<T>(content);
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"Supabase API Error: {ex.Message}", ex);
            }
        }

        public async Task<T> PostAsync<T>(string endpoint, object data)
        {
            try
            {
                var json = System.Text.Json.JsonSerializer.Serialize(data);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync(endpoint, content);
                response.EnsureSuccessStatusCode();
                
                var responseContent = await response.Content.ReadAsStringAsync();
                return System.Text.Json.JsonSerializer.Deserialize<T>(responseContent);
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"Supabase API Error: {ex.Message}", ex);
            }
        }

        public async Task<T> PutAsync<T>(string endpoint, string id, object data)
        {
            try
            {
                var json = System.Text.Json.JsonSerializer.Serialize(data);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PutAsync($"{endpoint}?id=eq.{id}", content);
                response.EnsureSuccessStatusCode();
                
                var responseContent = await response.Content.ReadAsStringAsync();
                return System.Text.Json.JsonSerializer.Deserialize<T>(responseContent);
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"Supabase API Error: {ex.Message}", ex);
            }
        }

        public async Task DeleteAsync(string endpoint, string id)
        {
            try
            {
                var response = await _httpClient.DeleteAsync($"{endpoint}?id=eq.{id}");
                response.EnsureSuccessStatusCode();
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"Supabase API Error: {ex.Message}", ex);
            }
        }
    }
}
