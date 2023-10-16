#include <bits/stdc++.h>

using namespace std;

int bfs(int source,int target,int n,vector<int>& parent,vector<vector<int>>& graph){
    //Update the parent vector as each node value to be -1
        fill(parent.begin(),parent.end(),-1);
    //parent of source node to be -2
        parent[source] = -2;
    //Initializing queue for storing and min capacity so far
        queue<pair<int,int>> q;
    //Source node min capacity to be 1e9
        q.push({source,1e9});
        
    //Looping while queue is not empty 
        while(!q.empty()){
            //storing top node and min capacity so far
            int u = q.front().first;
            int cap = q.front().second;
            //Removing top node from queue
            q.pop();
            //Looping all edges from u
            for(int v=0;v<n;v++){
                //finding v node has edge from u
                if(u!=v && graph[u][v]!=0 && parent[v]==-1){
                    //storing parent v to be u
                    parent[v] = u;
                    //Updating the minimum capacity
                    int min_cap = min(cap,graph[u][v]);
                    //If v is the target node then return minimum capacity
                    if(v==target){
                        return min_cap;
                    }
                    //if we didn't find target node
                    //Insert the v node and minimum capacity so far in queue
                    q.push({v,min_cap});
                }
            }
        }
    //if we didn't find path between source to target return 0
        return 0;
}

int Ford_Fulkerson(int source,int target,int n,vector<vector<int>>& graph){
    //Initializing parent vector for finding the path from source to target
    //In which we add parent of the node
        vector<int> parent(n,-1);
    //Initializing maximum flow for storing ans
        int max_flow = 0;
        int min_cap = 0;   //storing minimum capacity in each path
        
    //looping while minimum capacity become zero 
    //For finding path and minimum capacity we call function bfs()
        while(min_cap = bfs(source,target,n,parent,graph)){
            //Adding the min_cap from this path 
            max_flow += min_cap;
            //storing target node in v
            int v = target;
            
            //while we didn't find the source node
            //Looping through path stored in parent 
            while(v!=source){
                //finding parent of v node
                int u = parent[v];
                //Subtracting minimum capacity from u to v
                //And adding minimum capacity from v to u
                graph[u][v] -= min_cap;
                graph[v][u] += min_cap;
                //Update the v node to it's parent
                v=u;
            }
        }
    //Returning maximum flow in the graph
        return max_flow;
    }

void addEdge(vector<vector<int>>& graph,
             int u, int v, int w)
{
    graph[u][v] = w;
}

int main()
{
    //Intializing the graph in 2d vector
    int V = 6;
    vector<vector<int>> graph(V, vector<int> (V, 0));
  //Adding edges weight in the graph
    addEdge(graph, 0, 1, 4);
    addEdge(graph, 0, 3, 3);
    addEdge(graph, 1, 2, 4);
    addEdge(graph, 2, 3, 3);
    addEdge(graph, 2, 5, 2);
    addEdge(graph, 3, 4, 6);
    addEdge(graph, 4, 5, 6);
    
    //Printing the maximum flow from the given network Using Ford Fulkerson Method
    cout << "Maximum Flow Using Ford Fulkerson Algo: " << Ford_Fulkerson(0,5,V,graph) << endl;
    return 0;
}
