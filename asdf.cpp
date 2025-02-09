#include <iostream>
#include <cstring>

class String {
private:
    char* buf;
    
    // Private static helper method pluscpy
    static char* pluscpy(char* dest, const char* left, const char* right) {
        strcpy(dest, left);
        strcat(dest, right);
        return dest;
    }
    
    // Private constructor
    String(int len) { 
        buf = new char[len]; 
    }
    
public:
    // Constructor
    String(const char* str = "") {
        buf = new char[strlen(str) + 1];
        strcpy(buf, str);
    }
    
    // Destructor
    ~String() { delete[] buf; }
    
    // Copy constructor
    String(const String& other) {
        buf = new char[strlen(other.buf) + 1];
        strcpy(buf, other.buf);
    }
    
    // Move constructor
    String(String&& other) noexcept : buf(other.buf) { other.buf = nullptr; }
    
    // Copy assignment
    String& operator=(const String& other) {
        if (this != &other) {
            delete[] buf;
            buf = new char[strlen(other.buf) + 1];
            strcpy(buf, other.buf);
        }
        return *this;
    }
    
    // Move assignment operator
    String& operator=(String&& other) {
        if (this != &other) {
            swap(other.buf); // Correct use of swap
        }
        return *this;
    }
    
    // Operator+ for string concatenation
    String operator+(const String& right) const {
        int len = strlen(buf) + strlen(right.buf);
        String newStr(len);
        pluscpy(newStr.buf, buf, right.buf);
        return newStr;
    }
    
    // Output operator
    friend std::ostream& operator<<(std::ostream& os, const String& str) {
        os << str.buf;
        return os;
    }
};

// Main function to test the class
int main() {
    String A("You ");
    String B("only live ");
    String C("once");
    C = A + B + C; // Concatenation in one statement
    std::cout << C << std::endl; // Output: You only live once
    return 0;
}
