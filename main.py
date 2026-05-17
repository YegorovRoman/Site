from unicodedata import digit


class Ege:

    def __init__(self, n):
        self.n = n
        self.r = 0
        self.summ = 0


    def bin2(self):
        self.r = bin(self.n)[2:]
        return f'r = {self.r}'

    def summ_bin2(self):
        self.summ = sum(int(digit) for digit in self.r)
        return f'summ = {self.summ}'

    def delenie(self):
        if not self.summ % 2 == 0:
            self.r += '1'
        return f'r = {self.r}'


    def __str__(self):
        return f'r = {self.r}, n = {self.n}'


zxc = Ege(61)
print(zxc.bin2())
print(zxc.summ_bin2())
print(zxc.delenie())